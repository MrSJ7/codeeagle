import { PROJECT_LIMITS } from "../config/limits.js";
import { getGeminiClient, analyzeCodeWithGemini } from "./geminiService.js";
import { deduplicateIssues } from "./issueDeduplicator.js";
import { filterGroundedAiFindings } from "./aiValidator.js";

/**
 * Checks if Gemini client is configured.
 */
export function isGeminiConfigured() {
  return !!getGeminiClient();
}

const SENSITIVE_DOMAIN_REGEX = /(auth|token|secret|crypto|security|login|session|password|credential|db|database|payment|user)/i;

/**
 * Selects candidate files that benefit most from deep semantic AI analysis.
 * Prioritizes files with security exposure, high complexity, cross-file connectivity, or dependency cycles.
 *
 * @param {Array<Object>} files Project file manifests
 * @param {Map<string, Object>} fileResults Deterministic analysis results map
 * @param {Object} [projectContext] Optional ProjectContext graph instance
 * @returns {Array<Object>} Selected candidate files
 */
export function selectAiCandidateFiles(files, fileResults, projectContext = null) {
  const eligible = files.filter((f) => f.status === "ELIGIBLE" && f.content && fileResults.has(f.id));

  // Score each file based on context and risk indicators
  const scored = eligible.map((file) => {
    const res = fileResults.get(file.id);
    let relevance = 0;

    if (res) {
      const issueCount = res.issues?.length || 0;
      const criticalCount = (res.issues || []).filter((i) => i.severity === "CRITICAL").length;
      const highCount = (res.issues || []).filter((i) => i.severity === "HIGH").length;
      const complexity = res.metrics?.complexity || 0;
      const branches = res.metrics?.branches || 0;

      relevance = (criticalCount * 12) + (highCount * 8) + (issueCount * 3) + (complexity * 2) + branches;
    }

    // Contextual graph metrics if available
    if (projectContext && projectContext.nodes) {
      const node = projectContext.nodes.get(file.path);
      if (node) {
        // High cross-file connectivity elevates review importance
        const crossDegree = (node.fanIn || 0) + (node.fanOut || 0);
        relevance += crossDegree * 3;

        // Circular dependencies elevate risk
        if (node.hasCycle) {
          relevance += 10;
        }
      }
    }

    // Sensitive domain boost (auth, tokens, crypto, db)
    if (SENSITIVE_DOMAIN_REGEX.test(file.path)) {
      relevance += 15;
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
 * @param {Object} [options.projectContext] ProjectContext graph instance
 * @param {(progress: {completed: number, total: number, currentFile: string}) => void} [options.onProgress]
 * @returns {Promise<{
 *   updatedFileResults: Map<string, Object>,
 *   allIssues: Array<Object>,
 *   aiAnalyzedCount: number,
 *   engine: "hybrid" | "static" | "hybrid-partial"
 * }>}
 */
export async function runProjectAiReview({
  projectId,
  reviewId,
  files,
  fileResults,
  projectContext = null,
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

  const candidateFiles = selectAiCandidateFiles(files, fileResults, projectContext);
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

    // Distill local cross-file dependencies and contracts
    const distilledContext = projectContext && typeof projectContext.buildDistilledContext === 'function'
      ? projectContext.buildDistilledContext(file.path, PROJECT_LIMITS.MAX_AI_CONTEXT_BYTES)
      : null;

    try {
      const outcome = await analyzeCodeWithGemini({
        code: file.content,
        filename: file.filename,
        language: file.language || "javascript",
        staticIssues,
        metrics: staticRes?.metrics || {},
        distilledContext,
      });

      const rawAiFindings = (outcome.data?.findings || outcome.data?.issues || []);

      if (outcome.status === "SUCCESS" && Array.isArray(rawAiFindings)) {
        // Filter out low confidence or cosmetic style complaints
        const vettedAiFindings = filterGroundedAiFindings(rawAiFindings, {
          minConfidence: PROJECT_LIMITS.AI_FINDING_MIN_CONFIDENCE || 0.70,
        });

        // Ground AI issues with project and file IDs
        const groundedAiIssues = vettedAiFindings.map((issue) => ({
          ...issue,
          fileId: file.id,
          path: file.path,
          projectId,
          reviewId,
          source: "AI",
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

  let engine = "static";
  if (aiSuccessCount === candidateFiles.length && candidateFiles.length > 0) {
    engine = "hybrid";
  } else if (aiSuccessCount > 0) {
    engine = "hybrid"; // partial hybrid is still hybrid
  }

  return {
    updatedFileResults: fileResults,
    allIssues: flatIssues,
    aiAnalyzedCount: aiSuccessCount,
    engine,
  };
}
