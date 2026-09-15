/**
 * Deterministic Score, Breakdown, and Summary Calculator.
 *
 * Scoring Policy:
 * 1. Base Score = 100
 * 2. Severity Base Deductions:
 *    - CRITICAL: -25 points
 *    - HIGH: -15 points
 *    - MEDIUM: -8 points
 *    - LOW: -3 points
 * 3. Confidence Multipliers:
 *    - STATIC findings (trusted baseline): multiplier = 1.00
 *    - AI findings (calibrated by validated confidence):
 *      * confidence < 0.60   => 0.50
 *      * 0.60 <= conf < 0.80 => 0.75
 *      * confidence >= 0.80  => 1.00
 * 4. Deductions are clamped: Overall score and category scores never fall below 0.
 */

export const SEVERITY_DEDUCTIONS = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 8,
  LOW: 3,
};

/**
 * Returns the confidence-weighted penalty multiplier for an issue.
 * @param {object} issue Canonical issue
 * @returns {number} Multiplier (0.50, 0.75, or 1.00)
 */
export function getConfidenceMultiplier(issue) {
  if (issue.source === 'STATIC') {
    return 1.0;
  }

  const conf = typeof issue.confidence === 'number' ? issue.confidence : 0.8;
  if (conf < 0.6) {
    return 0.5;
  }
  if (conf < 0.8) {
    return 0.75;
  }
  return 1.0;
}

/**
 * Computes the exact deduction for a single issue.
 * @param {object} issue Canonical issue
 * @returns {number} Integer deduction
 */
export function calculateIssueDeduction(issue) {
  const base = SEVERITY_DEDUCTIONS[issue.severity] || 3;
  const multiplier = getConfidenceMultiplier(issue);
  return Math.round(base * multiplier);
}

/**
 * Calculates issue count summary by severity strictly from the final issue list.
 *
 * @param {Array} issues Canonical merged issues
 * @returns {{ totalIssues: number, critical: number, high: number, medium: number, low: number }}
 */
export function calculateSummary(issues = []) {
  return {
    totalIssues: issues.length,
    critical: issues.filter((i) => i.severity === 'CRITICAL').length,
    high: issues.filter((i) => i.severity === 'HIGH').length,
    medium: issues.filter((i) => i.severity === 'MEDIUM').length,
    low: issues.filter((i) => i.severity === 'LOW').length,
  };
}

/**
 * Calculates deterministic overall score and category breakdown from final issues.
 *
 * @param {Array} issues Canonical merged and sorted issues
 * @param {boolean} [hasSyntaxError=false]
 * @returns {{ score: number, breakdown: { security: number, quality: number, performance: number, complexity: number } }}
 */
export function calculateScores(issues = [], hasSyntaxError = false) {
  if (hasSyntaxError) {
    return {
      score: 0,
      breakdown: {
        security: 100,
        quality: 0,
        performance: 100,
        complexity: 100,
      },
    };
  }

  let totalDeductions = 0;
  const categoryDeductions = {
    SECURITY: 0,
    QUALITY: 0,
    PERFORMANCE: 0,
    COMPLEXITY: 0,
  };

  issues.forEach((issue) => {
    const deduction = calculateIssueDeduction(issue);
    totalDeductions += deduction;

    const cat = (issue.category || 'QUALITY').toUpperCase();
    if (categoryDeductions[cat] !== undefined) {
      categoryDeductions[cat] += deduction;
    } else {
      categoryDeductions.QUALITY += deduction;
    }
  });

  const overallScore = Math.max(0, Math.min(100, 100 - totalDeductions));

  const breakdown = {
    security: Math.max(0, Math.min(100, 100 - categoryDeductions.SECURITY)),
    quality: Math.max(0, Math.min(100, 100 - categoryDeductions.QUALITY)),
    performance: Math.max(0, Math.min(100, 100 - categoryDeductions.PERFORMANCE)),
    complexity: Math.max(0, Math.min(100, 100 - categoryDeductions.COMPLEXITY)),
  };

  return {
    score: overallScore,
    breakdown,
  };
}
