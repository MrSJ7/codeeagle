/**
 * Review helper utilities for issue sorting, filtering, and schema normalization.
 */

export const SEVERITY_ORDER = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

/**
 * Deterministically sorts issues:
 * 1. Severity order (CRITICAL -> HIGH -> MEDIUM -> LOW)
 * 2. Source line ascending
 * 3. Rule name ascending
 * 4. ID ascending
 */
export function sortIssues(issues = []) {
  return [...issues].sort((a, b) => {
    const rankA = SEVERITY_ORDER[a.severity?.toUpperCase()] ?? 99;
    const rankB = SEVERITY_ORDER[b.severity?.toUpperCase()] ?? 99;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    const lineA = typeof a.line === 'number' ? a.line : 0;
    const lineB = typeof b.line === 'number' ? b.line : 0;
    if (lineA !== lineB) {
      return lineA - lineB;
    }

    const ruleCompare = (a.rule || '').localeCompare(b.rule || '');
    if (ruleCompare !== 0) return ruleCompare;

    return (a.id || '').localeCompare(b.id || '');
  });
}

/**
 * Filters issues by severity without mutating the original list.
 */
export function filterIssues(issues = [], filter = 'ALL') {
  if (!filter || filter === 'ALL') {
    return issues;
  }
  const norm = filter.toUpperCase();
  return issues.filter((i) => i.severity?.toUpperCase() === norm);
}

/**
 * Calculates issue count breakdown by severity.
 */
export function getSeverityCounts(issues = []) {
  const counts = {
    ALL: issues.length,
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  issues.forEach((issue) => {
    const sev = issue.severity?.toUpperCase();
    if (counts[sev] !== undefined) {
      counts[sev] += 1;
    }
  });

  return counts;
}

/**
 * Validates and normalizes review payload ensuring safe defaults for optional fields
 * and preserving top-level metadata and summary.
 */
export function normalizeReviewData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed review data received.');
  }

  const score = typeof data.score === 'number' ? Math.max(0, Math.min(100, Math.round(data.score))) : 0;

  const breakdown = {
    security: data.breakdown?.security ?? score,
    quality: data.breakdown?.quality ?? score,
    performance: data.breakdown?.performance ?? score,
    complexity: data.breakdown?.complexity ?? score,
  };

  const metrics = {
    lines: data.metrics?.lines ?? 0,
    functions: data.metrics?.functions ?? 0,
    branches: data.metrics?.branches ?? 0,
    complexity: data.metrics?.complexity ?? 0,
    maxNesting: data.metrics?.maxNesting ?? 0,
  };

  const issues = Array.isArray(data.issues)
    ? data.issues.map((issue, idx) => ({
        id: issue.id || `ISSUE-${idx + 1}`,
        rule: issue.rule || 'STATIC',
        source: issue.source === 'AI' ? 'AI' : 'STATIC',
        severity: (issue.severity || 'LOW').toUpperCase(),
        category: issue.category || 'QUALITY',
        title: issue.title || 'Untitled Issue',
        line: typeof issue.line === 'number' ? issue.line : 1,
        endLine: typeof issue.endLine === 'number' ? issue.endLine : issue.line || 1,
        description: issue.description || 'No description provided.',
        recommendation: issue.recommendation || 'No recommendation provided.',
        confidence: typeof issue.confidence === 'number' ? issue.confidence : 1.0,
        fix: issue.fix && typeof issue.fix === 'object'
          ? {
              original: issue.fix.original || '',
              replacement: issue.fix.replacement || '',
            }
          : null,
      }))
    : [];

  const summary = data.summary || {
    totalIssues: issues.length,
    critical: issues.filter((i) => i.severity === 'CRITICAL').length,
    high: issues.filter((i) => i.severity === 'HIGH').length,
    medium: issues.filter((i) => i.severity === 'MEDIUM').length,
    low: issues.filter((i) => i.severity === 'LOW').length,
  };

  return {
    score,
    breakdown,
    metrics,
    issues: sortIssues(issues),
    summary,
    metadata: data.metadata || null,
    reviewId: data.reviewId || null,
  };
}
