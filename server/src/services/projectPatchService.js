import crypto from "node:crypto";
import { applyPatch, verifyPatch } from "./patchService.js";
import { applyAiPatch, verifyAiPatch } from "./aiPatchVerifier.js";
import { analyzeCode } from "../analyzers/analyzeCode.js";
import { computeCodeHash } from "../utils/codeHasher.js";
import { calculateProjectScore } from "./projectScoreCalculator.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { computeProjectSourceHash } from "../utils/paths.js";

/**
 * Applies a verified code patch to a specific file inside a project review,
 * re-analyzes the modified file, recomputes project health, diffs findings,
 * and persists a new immutable review snapshot.
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {string} options.reviewId
 * @param {string} options.fileId
 * @param {string} options.findingId
 * @param {string} [options.expectedHash]
 * @returns {Promise<Object>} Patch result with updated review snapshot and diff
 */
export async function applyProjectPatch({
  projectId,
  reviewId,
  fileId,
  findingId,
  expectedHash = null,
}) {
  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    const err = new Error(`Project "${projectId}" not found.`);
    err.code = "PROJECT_NOT_FOUND";
    err.status = 404;
    throw err;
  }

  const review = await projectRepository.getReviewById(reviewId);
  if (!review) {
    const err = new Error(`Review "${reviewId}" not found.`);
    err.code = "REVIEW_NOT_FOUND";
    err.status = 404;
    throw err;
  }

  // Find target file inside review and project
  const reviewFile = (review.files || []).find((f) => f.id === fileId || f.path === fileId);
  if (!reviewFile) {
    const err = new Error(`File "${fileId}" not found in review.`);
    err.code = "FILE_NOT_FOUND";
    err.status = 404;
    throw err;
  }

  const projectFile = (project.files || []).find((f) => f.id === reviewFile.id || f.path === reviewFile.path);
  if (!projectFile || !projectFile.content) {
    const err = new Error(`Source content for file "${reviewFile.path}" not found.`);
    err.code = "SOURCE_NOT_FOUND";
    err.status = 404;
    throw err;
  }

  // Find target finding
  const finding = (reviewFile.issues || []).find((i) => i.id === findingId) ||
    (review.findings || []).find((i) => i.id === findingId);

  if (!finding) {
    const err = new Error(`Finding "${findingId}" not found for file "${reviewFile.path}".`);
    err.code = "FINDING_NOT_FOUND";
    err.status = 404;
    throw err;
  }

  const originalSource = projectFile.content;
  const currentFileHash = computeCodeHash(originalSource);

  if (expectedHash && expectedHash !== currentFileHash) {
    const err = new Error("Source file has changed since review was generated.");
    err.code = "STALE_SOURCE";
    err.status = 409;
    throw err;
  }

  // Apply patch according to source (STATIC vs AI)
  let patchOutcome;
  const isAi = finding.source === "AI";

  if (isAi) {
    patchOutcome = applyAiPatch({ code: originalSource, codeHash: currentFileHash, issue: finding });
  } else {
    patchOutcome = applyPatch({ code: originalSource, codeHash: currentFileHash, issue: finding });
  }

  if (!patchOutcome.success) {
    const err = new Error(`Failed to apply patch: ${patchOutcome.reason || "Verification failed"}`);
    err.code = patchOutcome.reason || "PATCH_FAILED";
    err.status = 422;
    throw err;
  }

  const patchedSource = patchOutcome.patchedCode;
  const newFileHash = patchOutcome.afterHash;

  // Run targeted re-analysis on modified file
  const reAnalysis = analyzeCode(patchedSource, reviewFile.language || "javascript", reviewFile.filename || reviewFile.path);

  const newReviewId = `prev_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const updatedFileIssues = (reAnalysis.issues || []).map((issue) => ({
    ...issue,
    fileId: reviewFile.id,
    path: reviewFile.path,
    projectId,
    reviewId: newReviewId,
  }));

  // Update project files array with new patched content
  const updatedProjectFiles = project.files.map((f) => {
    if (f.id === reviewFile.id || f.path === reviewFile.path) {
      return {
        ...f,
        content: patchedSource,
        contentHash: newFileHash,
        lineCount: patchedSource.split(/\r?\n/).length,
        size: Buffer.byteLength(patchedSource, "utf8"),
      };
    }
    return f;
  });

  // Recompute project source hash
  const newProjectSourceHash = computeProjectSourceHash(updatedProjectFiles);

  // Build updated file reviews
  const updatedFileReviews = review.files.map((f) => {
    if (f.id === reviewFile.id || f.path === reviewFile.path) {
      const issues = updatedFileIssues;
      return {
        ...f,
        contentHash: newFileHash,
        lineCount: patchedSource.split(/\r?\n/).length,
        size: Buffer.byteLength(patchedSource, "utf8"),
        score: reAnalysis.score,
        breakdown: reAnalysis.breakdown,
        metrics: reAnalysis.metrics,
        findingCount: issues.length,
        severityCounts: {
          critical: issues.filter((i) => i.severity === "CRITICAL").length,
          high: issues.filter((i) => i.severity === "HIGH").length,
          medium: issues.filter((i) => i.severity === "MEDIUM").length,
          low: issues.filter((i) => i.severity === "LOW").length,
        },
        issues,
      };
    }
    return f;
  });

  // Aggregate all project findings across all files
  const allUpdatedIssues = [];
  for (const f of updatedFileReviews) {
    if (f.issues && Array.isArray(f.issues)) {
      allUpdatedIssues.push(...f.issues);
    }
  }

  // Recalculate project health score
  const newHealth = calculateProjectScore(allUpdatedIssues, project.eligibleFileCount);

  // Compute Review Diff
  const beforeFindingIds = new Set((review.findings || []).map((i) => i.id));
  const afterFindingIds = new Set(allUpdatedIssues.map((i) => i.id));

  const resolvedIssues = (review.findings || []).filter((i) => !afterFindingIds.has(i.id));
  const remainingIssues = allUpdatedIssues.filter((i) => beforeFindingIds.has(i.id));
  const newIssues = allUpdatedIssues.filter((i) => !beforeFindingIds.has(i.id));

  const diff = {
    scoreBefore: review.score,
    scoreAfter: newHealth.score,
    resolvedCount: resolvedIssues.length,
    remainingCount: remainingIssues.length,
    newCount: newIssues.length,
    resolvedIssues,
    remainingIssues,
    newIssues,
    appliedIssueId: findingId,
    appliedFile: reviewFile.path,
  };

  const newReviewSnapshot = {
    id: newReviewId,
    reviewId: newReviewId,
    projectId,
    projectName: project.name,
    sourceType: project.sourceType,
    sourceMetadata: project.sourceMetadata,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: "complete",
    score: newHealth.score,
    healthStatus: newHealth.status,
    healthStatusLabel: newHealth.statusLabel,
    severityCounts: newHealth.severityCounts,
    breakdown: newHealth.breakdown,
    metrics: review.metrics,
    totalFiles: project.totalFileCount,
    filesAnalyzed: project.eligibleFileCount,
    filesSkipped: project.skippedFileCount,
    filesWithIssuesCount: updatedFileReviews.filter((f) => f.findingCount > 0).length,
    engine: review.engine,
    sourceSnapshotHash: newProjectSourceHash,
    topPriorities: newHealth.topPriorities,
    findings: allUpdatedIssues,
    files: updatedFileReviews,
    diff,
  };

  // Persist updated project & new review snapshot
  await projectRepository.saveProject({
    ...project,
    files: updatedProjectFiles,
    projectSourceHash: newProjectSourceHash,
    score: newHealth.score,
    healthStatus: newHealth.status,
    totalFindingCount: allUpdatedIssues.length,
    severityCounts: newHealth.severityCounts,
    latestReviewId: newReviewId,
  });

  await projectRepository.saveReview(newReviewSnapshot);

  return {
    success: true,
    reviewId: newReviewId,
    scoreBefore: review.score,
    scoreAfter: newHealth.score,
    patchedCode: patchedSource,
    review: newReviewSnapshot,
    diff,
  };
}
