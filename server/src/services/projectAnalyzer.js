import { analyzeCode } from "../analyzers/analyzeCode.js";
import { PROJECT_LIMITS } from "../config/limits.js";

/**
 * Executes static deterministic AST analysis across all eligible files with bounded concurrency.
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {string} options.reviewId
 * @param {Array<Object>} options.files ProjectManifest files
 * @param {(progress: {completed: number, total: number, currentFile: string}) => void} [options.onProgress]
 * @returns {Promise<{
 *   fileResults: Map<string, Object>,
 *   staticIssues: Array<Object>,
 *   filesAnalyzed: number,
 *   filesSkipped: number,
 *   totalMetrics: Object
 * }>}
 */
export async function runProjectStaticAnalysis({
  projectId,
  reviewId,
  files,
  onProgress = null,
}) {
  const eligibleFiles = files.filter((f) => f.status === "ELIGIBLE" && f.content);
  const fileResults = new Map();
  const staticIssues = [];

  let completed = 0;
  const total = eligibleFiles.length;

  const totalMetrics = {
    lines: 0,
    functions: 0,
    branches: 0,
    complexity: 0,
    maxNesting: 0,
  };

  // Helper for bounded worker queue
  async function worker(queue) {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) break;

      if (onProgress) {
        onProgress({
          completed,
          total,
          currentFile: file.path,
        });
      }

      try {
        const result = analyzeCode(file.content, file.language || "javascript", file.filename || file.path);

        // Ground every issue to this specific project file
        const enrichedIssues = (result.issues || []).map((issue) => ({
          ...issue,
          fileId: file.id,
          path: file.path,
          projectId,
          reviewId,
        }));

        staticIssues.push(...enrichedIssues);

        const metrics = result.metrics || {
          lines: file.lineCount || 0,
          functions: 0,
          branches: 0,
          complexity: 0,
          maxNesting: 0,
        };

        totalMetrics.lines += metrics.lines || 0;
        totalMetrics.functions += metrics.functions || 0;
        totalMetrics.branches += metrics.branches || 0;
        totalMetrics.complexity += metrics.complexity || 0;
        totalMetrics.maxNesting = Math.max(totalMetrics.maxNesting, metrics.maxNesting || 0);

        fileResults.set(file.id, {
          fileId: file.id,
          path: file.path,
          filename: file.filename,
          language: file.language,
          codeHash: file.contentHash,
          score: result.score,
          breakdown: result.breakdown,
          metrics,
          issues: enrichedIssues,
          summary: result.summary,
          status: "SUCCESS",
          error: null,
        });
      } catch (err) {
        console.warn(`[ProjectAnalyzer] Error analyzing file ${file.path}: ${err.message}`);
        fileResults.set(file.id, {
          fileId: file.id,
          path: file.path,
          filename: file.filename,
          language: file.language,
          codeHash: file.contentHash,
          score: 0,
          breakdown: { security: 100, quality: 0, performance: 100, complexity: 100 },
          metrics: { lines: file.lineCount || 0, functions: 0, branches: 0, complexity: 0, maxNesting: 0 },
          issues: [
            {
              id: `ERR-PARSE-${file.id}`,
              rule: "SYNTAX",
              source: "STATIC",
              severity: "CRITICAL",
              category: "QUALITY",
              title: "Unable to parse source code",
              line: 1,
              endLine: 1,
              description: `AST parsing failed: ${err.message}`,
              recommendation: "Ensure file contains valid JavaScript / JSX syntax.",
              confidence: 1.0,
              fix: null,
              fileId: file.id,
              path: file.path,
              projectId,
              reviewId,
            },
          ],
          summary: { totalIssues: 1, critical: 1, high: 0, medium: 0, low: 0 },
          status: "FAILED",
          error: err.message,
        });
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
  }

  // Launch bounded worker promises
  const queue = [...eligibleFiles];
  const concurrency = Math.min(PROJECT_LIMITS.STATIC_ANALYSIS_CONCURRENCY, eligibleFiles.length || 1);
  const workers = Array.from({ length: concurrency }, () => worker(queue));

  await Promise.all(workers);

  return {
    fileResults,
    staticIssues,
    filesAnalyzed: eligibleFiles.length,
    filesSkipped: files.length - eligibleFiles.length,
    totalMetrics,
  };
}
