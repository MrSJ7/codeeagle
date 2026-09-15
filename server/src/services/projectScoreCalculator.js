/**
 * Deterministic Project Score & Severity Aggregator.
 * Derives project health from real findings distribution without fabricating metrics.
 */

const SEVERITY_BASE_PENALTIES = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 8,
  LOW: 3,
};

const SEVERITY_NORMALIZED_WEIGHT = {
  CRITICAL: 1.0,
  HIGH: 0.75,
  MEDIUM: 0.50,
  LOW: 0.25,
};

const CATEGORY_MAP = {
  SECURITY: "security",
  QUALITY: "quality",
  PERFORMANCE: "performance",
  COMPLEXITY: "complexity",
};

/**
 * Calculates deterministic, explainable priority score for a finding.
 * Formula: (severityWeight * 0.45) + (confidence * 0.35) + (evidenceWeight * 0.20)
 *
 * @param {Object} issue Finding object
 * @returns {number} Float priority between 0.00 and 1.00
 */
export function calculateFindingPriority(issue) {
  const sev = (issue.severity || "LOW").toUpperCase();
  const sevWeight = SEVERITY_NORMALIZED_WEIGHT[sev] ?? 0.25;
  const confidence = Math.max(0, Math.min(1, typeof issue.confidence === "number" ? issue.confidence : 0.8));
  const hasEvidenceOrFix = !!(issue.fix?.original || issue.evidence);
  const evidenceWeight = hasEvidenceOrFix ? 1.0 : 0.5;

  const raw = (sevWeight * 0.45) + (confidence * 0.35) + (evidenceWeight * 0.20);
  return Math.round(raw * 100) / 100;
}

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

  const categoryCounts = {
    security: 0,
    quality: 0,
    performance: 0,
    complexity: 0,
  };

  const categoryPenalties = {
    security: 0,
    quality: 0,
    performance: 0,
    complexity: 0,
  };

  // Anti-double-counting: track line-level penalties and maintainability cap
  const seenLineRanges = new Set();
  let totalPenalty = 0;
  let maintainabilityPenaltyTotal = 0;
  const MAX_MAINTAINABILITY_PENALTY = 15;

  for (const issue of allIssues) {
    const sev = (issue.severity || "LOW").toUpperCase();
    const basePenalty = SEVERITY_BASE_PENALTIES[sev] || SEVERITY_BASE_PENALTIES.LOW;
    const impactMultiplier = typeof issue.impactWeight === "number" ? issue.impactWeight : 1.0;

    // Severity counts
    if (sev === "CRITICAL") severityCounts.critical++;
    else if (sev === "HIGH") severityCounts.high++;
    else if (sev === "MEDIUM") severityCounts.medium++;
    else severityCounts.low++;

    // Category counts
    const categoryKey = CATEGORY_MAP[(issue.category || "QUALITY").toUpperCase()] || "quality";
    categoryCounts[categoryKey] = (categoryCounts[categoryKey] || 0) + 1;

    // Correlated finding line discount (same file and exact same line range)
    const lineKey = `${issue.path || issue.fileId}:${issue.line}-${issue.endLine}`;
    const isCorrelated = seenLineRanges.has(lineKey);
    seenLineRanges.add(lineKey);

    let effectivePenalty = basePenalty;
    if (isCorrelated) {
      effectivePenalty = Math.round(basePenalty * 0.5); // 50% discount on duplicate line penalties
    }

    // Maintainability heuristics cap
    const isMaintainabilityHeuristic = (issue.ruleClass === "MAINTAINABILITY" || sev === "LOW") && categoryKey === "quality";
    if (isMaintainabilityHeuristic) {
      if (maintainabilityPenaltyTotal + effectivePenalty > MAX_MAINTAINABILITY_PENALTY) {
        effectivePenalty = Math.max(0, MAX_MAINTAINABILITY_PENALTY - maintainabilityPenaltyTotal);
      }
      maintainabilityPenaltyTotal += effectivePenalty;
    }

    totalPenalty += effectivePenalty;
    categoryPenalties[categoryKey] += effectivePenalty;

    // Attach calculated priority score
    issue.priorityScore = calculateFindingPriority(issue);
  }

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

  // Deterministically sort and select Top Priority issues using explainable priority score
  const sortedIssues = [...allIssues].sort((a, b) => {
    // 1. Priority Score
    const pDiff = (b.priorityScore || 0) - (a.priorityScore || 0);
    if (Math.abs(pDiff) >= 0.01) return pDiff > 0 ? 1 : -1;

    // 2. Severity order
    const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sDiff = (order[b.severity] || 0) - (order[a.severity] || 0);
    if (sDiff !== 0) return sDiff;

    // 3. Confidence
    const confDiff = (b.confidence || 0) - (a.confidence || 0);
    if (Math.abs(confDiff) >= 0.01) return confDiff > 0 ? 1 : -1;

    // 4. File path & line
    const pathCompare = String(a.path || "").localeCompare(String(b.path || ""));
    if (pathCompare !== 0) return pathCompare;
    return (a.line || 0) - (b.line || 0);
  });

  const topPriorities = sortedIssues.slice(0, 5);

  return {
    score: normalizedScore,
    status,
    statusLabel,
    severityCounts,
    categoryCounts,
    breakdown,
    topPriorities,
    sortedIssues,
  };
}
