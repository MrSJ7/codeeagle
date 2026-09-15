/**
 * Frontend Contract & Normalization Test Suite.
 * Verifies that normalizeReviewData correctly preserves canonical backend fields
 * without renaming or dropping properties.
 */
import { normalizeReviewData, sortIssues, filterIssues, getSeverityCounts } from '../src/utils/reviewHelpers.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== Starting Frontend Contract & Normalization Tests ===\n');

// 1. Canonical Backend Response Normalization
{
  const canonicalPayload = {
    score: 82,
    breakdown: {
      security: 75,
      quality: 90,
      performance: 100,
      complexity: 80,
    },
    metrics: {
      lines: 32,
      functions: 4,
      branches: 7,
      complexity: 8,
      maxNesting: 3,
    },
    issues: [
      {
        id: 'SEC-SECRET-6',
        rule: 'SEC-SECRET',
        source: 'STATIC',
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Hardcoded credential',
        line: 6,
        endLine: 6,
        description: 'Leaked token',
        recommendation: 'Use env',
        confidence: 1.0,
        fix: {
          original: 'const KEY = "abc";',
          replacement: 'const KEY = process.env.KEY;',
        },
      },
    ],
    summary: {
      totalIssues: 1,
      critical: 1,
      high: 0,
      medium: 0,
      low: 0,
    },
    metadata: {
      engine: 'static',
      language: 'javascript',
      filename: 'source.js',
      codeHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    },
  };

  const normalized = normalizeReviewData(canonicalPayload);

  // Score
  assert(normalized.score === 82, 'Score preserved as 82');

  // Breakdown
  assert(normalized.breakdown.security === 75, 'breakdown.security preserved');
  assert(normalized.breakdown.quality === 90, 'breakdown.quality preserved');
  assert(normalized.breakdown.performance === 100, 'breakdown.performance preserved');
  assert(normalized.breakdown.complexity === 80, 'breakdown.complexity preserved');

  // Metrics
  assert(normalized.metrics.lines === 32, 'metrics.lines stays lines (not renamed to loc)');
  assert(normalized.metrics.functions === 4, 'metrics.functions preserved');
  assert(normalized.metrics.branches === 7, 'metrics.branches preserved');
  assert(normalized.metrics.complexity === 8, 'metrics.complexity stays complexity (not renamed to cyclomaticComplexity)');
  assert(normalized.metrics.maxNesting === 3, 'metrics.maxNesting preserved');

  // Issues
  assert(normalized.issues.length === 1, 'Issues array preserved');
  const issue = normalized.issues[0];
  assert(issue.id === 'SEC-SECRET-6', 'issue.id preserved');
  assert(issue.rule === 'SEC-SECRET', 'issue.rule survives normalization');
  assert(issue.source === 'STATIC', 'issue.source remains STATIC');
  assert(issue.severity === 'CRITICAL', 'issue.severity remains CRITICAL');
  assert(issue.category === 'SECURITY', 'issue.category remains SECURITY');
  assert(issue.line === 6 && issue.endLine === 6, 'issue line numbers preserved');
  assert(issue.fix !== null && issue.fix.original === 'const KEY = "abc";', 'issue.fix verified and preserved');

  // Summary
  assert(normalized.summary.totalIssues === 1, 'summary.totalIssues survives normalization');
  assert(normalized.summary.critical === 1, 'summary.critical survives normalization');
  assert(normalized.summary.high === 0, 'summary.high survives normalization');

  // Metadata
  assert(normalized.metadata !== null, 'metadata survives normalization');
  assert(normalized.metadata.engine === 'static', 'metadata.engine preserved');
  assert(normalized.metadata.codeHash === 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', 'metadata.codeHash preserved');
  assert(normalized.metadata.timestamp === undefined, 'metadata does NOT require timestamp');
}

// 2. Safe Defaults on Missing / Partial Fields
{
  const partialPayload = {
    score: 95,
  };
  const normalized = normalizeReviewData(partialPayload);
  assert(normalized.metrics.lines === 0, 'Safe default 0 for metrics.lines');
  assert(normalized.metrics.complexity === 0, 'Safe default 0 for metrics.complexity');
  assert(Array.isArray(normalized.issues) && normalized.issues.length === 0, 'Safe empty array for issues');
  assert(normalized.summary.totalIssues === 0, 'Safe default summary computed');
}

// 3. Issue Filtering and Sorting
{
  const issues = [
    { id: 'LOW-1', severity: 'LOW', line: 10, rule: 'QUAL-VAR' },
    { id: 'CRIT-1', severity: 'CRITICAL', line: 5, rule: 'SEC-SECRET' },
    { id: 'HIGH-1', severity: 'HIGH', line: 2, rule: 'COMP-HIGH' },
  ];

  const sorted = sortIssues(issues);
  assert(sorted[0].id === 'CRIT-1', 'CRITICAL issue sorted first');
  assert(sorted[1].id === 'HIGH-1', 'HIGH issue sorted second');
  assert(sorted[2].id === 'LOW-1', 'LOW issue sorted third');

  const filteredCrit = filterIssues(sorted, 'CRITICAL');
  assert(filteredCrit.length === 1 && filteredCrit[0].id === 'CRIT-1', 'filterIssues handles CRITICAL filter');

  const counts = getSeverityCounts(sorted);
  assert(counts.ALL === 3 && counts.CRITICAL === 1 && counts.HIGH === 1 && counts.LOW === 1, 'getSeverityCounts returns accurate breakdown');
}

console.log(`\n=== Frontend Contract Test Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
