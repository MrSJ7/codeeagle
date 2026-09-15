/**
 * Compares two review outputs (before and after patch) to determine
 * resolved issues, remaining issues, and newly introduced issues.
 *
 * @param {Object} params
 * @param {Object} params.beforeReview - Review object prior to patching
 * @param {Object} params.afterReview - Fresh review object generated from patched code
 * @param {string} [params.appliedIssueId] - ID of the issue that was targeted by the patch
 * @returns {Object} Canonical diff summary
 */
export function computeReviewDiff({ beforeReview, afterReview, appliedIssueId = null }) {
  const beforeIssues = Array.isArray(beforeReview?.issues) ? beforeReview.issues : [];
  const afterIssues = Array.isArray(afterReview?.issues) ? afterReview.issues : [];

  const beforeMap = new Map(beforeIssues.map((issue) => [issue.id, issue]));
  const afterMap = new Map(afterIssues.map((issue) => [issue.id, issue]));

  // Issues present before but absent after
  const resolvedIssues = beforeIssues.filter((issue) => !afterMap.has(issue.id));

  // Issues present both before and after
  const remainingIssues = beforeIssues.filter((issue) => afterMap.has(issue.id));

  // Issues present after that were not present before
  const newIssues = afterIssues.filter((issue) => !beforeMap.has(issue.id));

  const scoreBefore = typeof beforeReview?.score === 'number' ? beforeReview.score : 0;
  const scoreAfter = typeof afterReview?.score === 'number' ? afterReview.score : 0;

  const appliedIssueResolved = appliedIssueId ? !afterMap.has(appliedIssueId) : null;

  return {
    resolvedIssues,
    remainingIssues,
    newIssues,
    scoreBefore,
    scoreAfter,
    appliedIssueId,
    appliedIssueResolved,
  };
}
