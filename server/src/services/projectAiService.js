import { PROJECT_LIMITS } from "../config/limits.js";
import { getGeminiClient, analyzeCodeWithGemini } from "./geminiService.js";
import { deduplicateIssues } from "./issueDeduplicator.js";

/**
 * Checks if Gemini client is configured.
 */
export function isGeminiConfigured() {
  return !!getGeminiClient();
}

/**
 * Selects candidate files that benefit most from deep semantic AI analysis.
 * Prioritizes files with high cyclomatic complexity, security issues, or large branching depth.
 */
export function selectAiCandidateFiles(files, fileResults) {
  const eligible = files.filter((f) => f.status === "ELIGIBLE" && f.content && fileResults.has(f.id));

  // Score each file based on analysis relevance
  const scored = eligible.map((file) => {
    const res = fileResults.get(file.id);
    let relevance = 0;

    if (res) {
      const issueCount = res.issues?.length || 0;
      const criticalOrHigh = (res.issues || []).filter(
        (i) => i.severity === "CRITICAL" || i.severity === "HIGH"
      ).length;
      const complexity = res.metrics?.complexity || 0;
      const branches = res.metrics?.branches || 0;

      relevance = (criticalOrHigh * 10) + (issueCount * 4) + (complexity * 2) + branches;
    }

    // Keep source size bounded for AI
    const size = Buffer.byteLength(file.content, "utf8");
    if (size > PROJECT_LIMITS.MAX_AI_SOURCE_BYTES) {
      relevance = -1; // Exceeds per-file AI budget
    }

    return { file, relevance, size };
  });

  return scored
    .filter((item) => item.relevance >= 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, PROJECT_LIMITS.MAX_AI_FILES_PER_REVIEW)
    .map((item) => item.file);
}

/**
 * Executes bounded Gemini AI semantic review on selected candidate files.
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {string} options.reviewId
 * @param {Array<Object>} options.files All project files
 * @param {Map<string, Object>} options.fileResults Static analysis results map
 * @param {(progress: {completed: number, total: number, currentFile: string}) => void} [options.onProgress]
 * @returns {Promise<{
 *   updatedFileResults: Map<string, Object>,
 *   allIssues: Array<Object>,
 *   aiAnalyzedCount: number,
 *   engine: "hybrid" | "static"
 * }>}
 */
export async function runProjectAiReview({
  projectId,
  reviewId,
  files,
  fileResults,
  onProgress = null,
}) {
  if (!isGeminiConfigured()) {
    console.log("[ProjectAiService] Gemini not configured. Keeping static deterministic findings.");
    const flatIssues = [];
    for (const res of fileResults.values()) {
      flatIssues.push(...(res.issues || []));
    }
    return {
      updatedFileResults: fileResults,
      allIssues: flatIssues,
      aiAnalyzedCount: 0,
      engine: "static",
    };
  }

  const candidateFiles = selectAiCandidateFiles(files, fileResults);
  if (candidateFiles.length === 0) {
    const flatIssues = [];
    for (const res of fileResults.values()) {
      flatIssues.push(...(res.issues || []));
    }
    return {
      updatedFileResults: fileResults,
      allIssues: flatIssues,
      aiAnalyzedCount: 0,
      engine: "static",
    };
  }

  let completed = 0;
  const total = candidateFiles.length;
  let aiSuccessCount = 0;

  for (const file of candidateFiles) {
    if (onProgress) {
      onProgress({
        completed,
        total,
        currentFile: file.path,
      });
    }

    const staticRes = fileResults.get(file.id);
    const staticIssues = staticRes?.issues || [];

    try {
      const outcome = await analyzeCodeWithGemini({
        code: file.content,
        filename: file.filename,
        language: file.language || "javascript",
        staticIssues,
        metrics: staticRes?.metrics || {},
      });

      if (outcome.status === "SUCCESS" && outcome.data && Array.isArray(outcome.data.issues)) {
        // Ground AI issues with project and file IDs
        const groundedAiIssues = outcome.data.issues.map((issue) => ({
          ...issue,
          fileId: file.id,
          path: file.path,
          projectId,
          reviewId,
        }));

        // Deduplicate static and AI findings safely
        const mergedIssues = deduplicateIssues(staticIssues, groundedAiIssues);

        // Update file record
        fileResults.set(file.id, {
          ...staticRes,
          issues: mergedIssues,
          summary: {
            totalIssues: mergedIssues.length,
            critical: mergedIssues.filter((i) => i.severity === "CRITICAL").length,
            high: mergedIssues.filter((i) => i.severity === "HIGH").length,
            medium: mergedIssues.filter((i) => i.severity === "MEDIUM").length,
            low: mergedIssues.filter((i) => i.severity === "LOW").length,
          },
        });

        aiSuccessCount++;
      }
    } catch (err) {
      console.warn(`[ProjectAiService] Gemini review skipped for ${file.path}: ${err.message}`);
    } finally {
      completed++;
      if (onProgress) {
        onProgress({
          completed,
          total,
          currentFile: file.path,
        });
      }
    }
  }

  const flatIssues = [];
  for (const res of fileResults.values()) {
    flatIssues.push(...(res.issues || []));
  }

  return {
    updatedFileResults: fileResults,
    allIssues: flatIssues,
    aiAnalyzedCount: aiSuccessCount,
    engine: aiSuccessCount > 0 ? "hybrid" : "static",
  };
}
