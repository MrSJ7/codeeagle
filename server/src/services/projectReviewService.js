import crypto from "node:crypto";
import { runProjectStaticAnalysis } from "./projectAnalyzer.js";
import { runProjectAiReview } from "./projectAiService.js";
import { calculateProjectScore } from "./projectScoreCalculator.js";
import { buildProjectContext } from "./projectContextService.js";
import { projectRepository } from "../repositories/projectRepository.js";

/**
 * Orchestrates full end-to-end project code review:
 * Ingestion -> Static Analysis -> Context Graph -> Bounded Gemini AI -> Deduplication -> Scoring -> Persistence
 *
 * @param {Object} options
 * @param {Object} options.manifest Normalized ProjectManifest
 * @param {(statusUpdate: Object) => void} [options.onProgress]
 * @returns {Promise<Object>} Completed project review document
 */
export async function executeProjectReview({ manifest, onProgress = null }) {
  const reviewId = `prev_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const projectId = manifest.id;

  if (onProgress) {
    onProgress({
      status: "analyzing",
      phase: "static",
      message: `Running static analysis across ${manifest.eligibleFileCount} eligible files...`,
      completed: 0,
      total: manifest.eligibleFileCount,
    });
  }

  // Phase 1: Static AST Deterministic Analysis
  const staticResult = await runProjectStaticAnalysis({
    projectId,
    reviewId,
    files: manifest.files,
    onProgress: (p) => {
      if (onProgress) {
        onProgress({
          status: "analyzing",
          phase: "static",
          message: `Analyzing ${p.currentFile} (${p.completed}/${p.total})...`,
          completed: p.completed,
          total: p.total,
          currentFile: p.currentFile,
        });
      }
    },
  });

  // Phase 1.5: Project Context & Dependency Graph Indexing
  const projectContext = buildProjectContext(manifest.files, staticResult.staticIssues);

  if (onProgress) {
    onProgress({
      status: "ai-review",
      phase: "ai",
      message: "Adding semantic contextual review for candidate files...",
      completed: 0,
      total: 5,
    });
  }

  // Phase 2: Bounded Gemini AI Semantic Reasoning with Project Context
  const aiResult = await runProjectAiReview({
    projectId,
    reviewId,
    files: manifest.files,
    fileResults: staticResult.fileResults,
    projectContext,
    onProgress: (p) => {
      if (onProgress) {
        onProgress({
          status: "ai-review",
          phase: "ai",
          message: `Semantic analysis on ${p.currentFile}...`,
          completed: p.completed,
          total: p.total,
          currentFile: p.currentFile,
        });
      }
    },
  });

  if (onProgress) {
    onProgress({
      status: "finalizing",
      phase: "finalizing",
      message: "Aggregating findings and computing project health score...",
    });
  }

  // Phase 3: Project Health Scoring & Summary
  const health = calculateProjectScore(aiResult.allIssues, manifest.eligibleFileCount);

  // Build per-file review structures enriched with graph metrics
  const fileReviews = manifest.files.map((file) => {
    const analysis = aiResult.updatedFileResults.get(file.id);
    const node = projectContext?.nodes?.get(file.path);

    if (file.status === "SKIPPED") {
      return {
        id: file.id,
        path: file.path,
        filename: file.filename,
        language: file.language,
        size: file.size,
        lineCount: file.lineCount,
        contentHash: file.contentHash,
        status: "SKIPPED",
        skipReason: file.skipReason,
        skipMessage: file.skipMessage,
        score: null,
        metrics: null,
        fanIn: 0,
        fanOut: 0,
        hasCycle: false,
        imports: [],
        exports: [],
        findingCount: 0,
        severityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        issues: [],
      };
    }

    const issues = analysis ? analysis.issues || [] : [];
    const severityCounts = {
      critical: issues.filter((i) => i.severity === "CRITICAL").length,
      high: issues.filter((i) => i.severity === "HIGH").length,
      medium: issues.filter((i) => i.severity === "MEDIUM").length,
      low: issues.filter((i) => i.severity === "LOW").length,
    };

    return {
      id: file.id,
      path: file.path,
      filename: file.filename,
      language: file.language,
      size: file.size,
      lineCount: file.lineCount,
      contentHash: file.contentHash,
      status: analysis ? analysis.status : "SUCCESS",
      skipReason: null,
      skipMessage: null,
      score: analysis ? analysis.score : 100,
      breakdown: analysis ? analysis.breakdown : { security: 100, quality: 100, performance: 100, complexity: 100 },
      metrics: analysis ? analysis.metrics : null,
      fanIn: node?.fanIn || 0,
      fanOut: node?.fanOut || 0,
      hasCycle: node?.hasCycle || false,
      imports: node?.imports || [],
      exports: (node?.exports || []).map((e) => e.name),
      findingCount: issues.length,
      severityCounts,
      issues,
    };
  });

  // Sort files with issues first, then clean files, then skipped files
  const filesWithIssuesCount = fileReviews.filter((f) => f.findingCount > 0).length;

  const reviewRecord = {
    id: reviewId,
    reviewId,
    projectId,
    projectName: manifest.name,
    sourceType: manifest.sourceType,
    sourceMetadata: manifest.sourceMetadata,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: "complete",
    score: health.score,
    healthStatus: health.status,
    healthStatusLabel: health.statusLabel,
    severityCounts: health.severityCounts,
    categoryCounts: health.categoryCounts,
    breakdown: health.breakdown,
    metrics: staticResult.totalMetrics,
    totalFiles: manifest.totalFileCount,
    filesAnalyzed: manifest.eligibleFileCount,
    filesSkipped: manifest.skippedFileCount,
    filesWithIssuesCount,
    engine: aiResult.engine,
    aiAnalyzedCount: aiResult.aiAnalyzedCount,
    sourceSnapshotHash: manifest.projectSourceHash,
    contextTopology: {
      totalCrossFileEdges: projectContext.topology.crossFileEdges,
      cyclesDetected: projectContext.topology.cyclesDetected,
      cycles: projectContext.cycles,
      entrypoints: projectContext.topology.entrypoints,
      leafNodes: projectContext.topology.leafNodes,
      centralFiles: projectContext.topology.centralFiles,
    },
    topPriorities: health.topPriorities,
    findings: aiResult.allIssues,
    files: fileReviews,
  };

  // Persist project and review
  await projectRepository.saveProject({
    id: projectId,
    name: manifest.name,
    sourceType: manifest.sourceType,
    sourceMetadata: manifest.sourceMetadata,
    projectSourceHash: manifest.projectSourceHash,
    totalFileCount: manifest.totalFileCount,
    eligibleFileCount: manifest.eligibleFileCount,
    skippedFileCount: manifest.skippedFileCount,
    score: health.score,
    healthStatus: health.status,
    totalFindingCount: aiResult.allIssues.length,
    severityCounts: health.severityCounts,
    status: "REVIEWED",
    latestReviewId: reviewId,
    files: manifest.files,
  });

  await projectRepository.saveReview(reviewRecord);

  if (onProgress) {
    onProgress({
      status: "complete",
      phase: "complete",
      message: "Review complete.",
      reviewId,
      score: health.score,
      totalIssues: aiResult.allIssues.length,
    });
  }

  return reviewRecord;
}
