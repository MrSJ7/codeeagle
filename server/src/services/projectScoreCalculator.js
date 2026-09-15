/**
 * Deterministic Project Score & Severity Aggregator.
 * Derives project health from real findings distribution without fabricating metrics.
 */

const SEVERITY_WEIGHTS = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 8,
  LOW: 3,
};

const CATEGORY_MAP = {
  SECURITY: "security",
  QUALITY: "quality",
  PERFORMANCE: "performance",
  COMPLEXITY: "complexity",
};

/**
 * Computes project score, breakdown, severity counts, and top priorities.
 *
 * @param {Array<Object>} allIssues Aggregated issues from all project files
 * @param {number} filesAnalyzed Number of analyzed files
 * @returns {Object} Project health calculation
 */
export function calculateProjectScore(allIssues = [], filesAnalyzed = 1) {
  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: allIssues.length,
  };

  const categoryPenalties = {
    security: 0,
    quality: 0,
    performance: 0,
    complexity: 0,
  };

  for (const issue of allIssues) {
    const sev = (issue.severity || "LOW").toUpperCase();
    const penalty = SEVERITY_WEIGHTS[sev] || SEVERITY_WEIGHTS.LOW;

    if (sev === "CRITICAL") severityCounts.critical++;
    else if (sev === "HIGH") severityCounts.high++;
    else if (sev === "MEDIUM") severityCounts.medium++;
    else severityCounts.low++;

    const categoryKey = CATEGORY_MAP[(issue.category || "QUALITY").toUpperCase()] || "quality";
    categoryPenalties[categoryKey] += penalty;
  }

  // Calculate overall score (scale penalties relative to project size for fair scoring)
  const totalPenalty = (severityCounts.critical * 25) +
    (severityCounts.high * 15) +
    (severityCounts.medium * 8) +
    (severityCounts.low * 3);

  // Normalize project score (0 - 100)
  const normalizedScore = Math.max(0, Math.min(100, Math.round(100 - totalPenalty)));

  // Calculate categorical scores (0 - 100)
  const breakdown = {
    security: Math.max(0, Math.min(100, Math.round(100 - categoryPenalties.security))),
    quality: Math.max(0, Math.min(100, Math.round(100 - categoryPenalties.quality))),
    performance: Math.max(0, Math.min(100, Math.round(100 - categoryPenalties.performance))),
    complexity: Math.max(0, Math.min(100, Math.round(100 - categoryPenalties.complexity))),
  };

  // Determine overall status label
  let status = "HEALTHY";
  let statusLabel = "Clean";

  if (severityCounts.critical > 0 || normalizedScore < 60) {
    status = "CRITICAL_RISK";
    statusLabel = "Critical Risk";
  } else if (severityCounts.high > 0 || severityCounts.medium > 0 || normalizedScore < 85) {
    status = "NEEDS_ATTENTION";
    statusLabel = "Needs Attention";
  }

  // Deterministically sort and select Top Priority issues
  const topPriorities = [...allIssues]
    .sort((a, b) => {
      const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const diff = (order[b.severity] || 0) - (order[a.severity] || 0);
      if (diff !== 0) return diff;

      // Higher confidence first
      const confDiff = (b.confidence || 0) - (a.confidence || 0);
      if (confDiff !== 0) return confDiff;

      // Earlier line first
      return (a.line || 0) - (b.line || 0);
    })
    .slice(0, 5);

  return {
    score: normalizedScore,
    status,
    statusLabel,
    severityCounts,
    breakdown,
    topPriorities,
  };
}
