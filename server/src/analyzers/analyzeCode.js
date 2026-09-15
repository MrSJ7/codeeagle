import { parseSource } from './parser.js';
import { analyzeMetrics } from './metricsAnalyzer.js';
import { analyzeSecurity } from './securityAnalyzer.js';
import { analyzeQuality } from './qualityAnalyzer.js';
import { countLines, verifyFixSnippet } from '../utils/sourceUtils.js';
import { computeCodeHash } from '../utils/codeHasher.js';

const SEVERITY_DEDUCTIONS = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 8,
  LOW: 3,
};

const SEVERITY_ORDER = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

/**
 * Normalizes language string identifier.
 */
export function normalizeLanguage(lang = 'javascript') {
  const lower = String(lang).toLowerCase().trim();
  if (lower === 'js' || lower === 'javascript') return 'javascript';
  if (lower === 'jsx') return 'jsx';
  return lower;
}

export function normalizeFinding(rawIssue, code) {
  const line = Math.max(1, typeof rawIssue.line === 'number' ? Math.floor(rawIssue.line) : 1);
  const endLine = Math.max(line, typeof rawIssue.endLine === 'number' ? Math.floor(rawIssue.endLine) : line);
  const severity = String(rawIssue.severity || 'LOW').toUpperCase();
  const validSeverity = SEVERITY_ORDER[severity] ? severity : 'LOW';
  const confidence = Math.max(0, Math.min(1, typeof rawIssue.confidence === 'number' ? rawIssue.confidence : 1.0));

  return {
    id: String(rawIssue.id || `${rawIssue.rule || 'RULE'}-${line}`),
    rule: String(rawIssue.rule || 'STATIC-RULE'),
    source: 'STATIC',
    severity: validSeverity,
    category: String(rawIssue.category || 'QUALITY').toUpperCase(),
    title: String(rawIssue.title || 'Untitled Issue'),
    line,
    endLine,
    description: String(rawIssue.description || 'No description provided.'),
    recommendation: String(rawIssue.recommendation || 'No recommendation provided.'),
    confidence,
    fix: verifyFixSnippet(code, rawIssue.fix),
  };
}

/**
 * Calculates issue count summary by severity.
 */
function calculateSummary(issues = []) {
  return {
    totalIssues: issues.length,
    critical: issues.filter((i) => i.severity === 'CRITICAL').length,
    high: issues.filter((i) => i.severity === 'HIGH').length,
    medium: issues.filter((i) => i.severity === 'MEDIUM').length,
    low: issues.filter((i) => i.severity === 'LOW').length,
  };
}

/**
 * Executes the complete deterministic static-analysis pipeline on source code.
 * Guaranteed zero code execution (AST & text parsing only).
 */
export function analyzeCode(code = '', language = 'javascript', filename = 'source.js') {
  const totalLines = countLines(code);
  const normalizedLang = normalizeLanguage(language);
  const codeHash = computeCodeHash(code);

  const baseMetadata = {
    engine: 'static',
    language: normalizedLang,
    filename: filename || 'source.js',
    codeHash,
  };

  // 1. Safe parsing step
  const { ast, syntaxError } = parseSource(code, normalizedLang);

  if (syntaxError) {
    const syntaxIssue = normalizeFinding(
      {
        id: `SYNTAX-${syntaxError.line}`,
        rule: 'SYNTAX',
        source: 'STATIC',
        severity: 'CRITICAL',
        category: 'QUALITY',
        title: 'Syntax error in source code',
        line: syntaxError.line,
        endLine: syntaxError.line,
        description: syntaxError.message,
        recommendation: 'Fix the syntax error before running deeper static analysis.',
        confidence: 1.0,
        fix: null,
      },
      code
    );

    const issues = [syntaxIssue];

    return {
      score: 0,
      breakdown: {
        security: 100,
        quality: 0,
        performance: 100,
        complexity: 100,
      },
      metrics: {
        lines: totalLines,
        functions: 0,
        branches: 0,
        complexity: 1,
        maxNesting: 0,
      },
      issues,
      summary: calculateSummary(issues),
      metadata: baseMetadata,
    };
  }

  // 2. Metrics calculation (Lines, Functions, Branches, Cyclomatic Complexity, Max Nesting)
  const { metrics, functionMetrics } = analyzeMetrics(ast, code);

  // 3. Static rules execution
  const securityIssues = analyzeSecurity(ast, code);
  const qualityIssues = analyzeQuality(ast, code, functionMetrics);

  // Normalize all findings through central validator
  const normalizedIssues = [...securityIssues, ...qualityIssues].map((issue) =>
    normalizeFinding(issue, code)
  );

  // Sort issues deterministically:
  // 1. Severity rank (CRITICAL -> HIGH -> MEDIUM -> LOW)
  // 2. Line ascending
  // 3. Rule name ascending
  // 4. ID ascending
  const sortedIssues = normalizedIssues.sort((a, b) => {
    const rankA = SEVERITY_ORDER[a.severity] ?? 99;
    const rankB = SEVERITY_ORDER[b.severity] ?? 99;
    if (rankA !== rankB) return rankA - rankB;

    if (a.line !== b.line) return a.line - b.line;

    const ruleCompare = (a.rule || '').localeCompare(b.rule || '');
    if (ruleCompare !== 0) return ruleCompare;

    return (a.id || '').localeCompare(b.id || '');
  });

  // 4. Deterministic scoring
  let overallScore = 100;
  let securityScore = 100;
  let qualityScore = 100;
  let performanceScore = 100;
  let complexityScore = 100;

  sortedIssues.forEach((issue) => {
    const penalty = SEVERITY_DEDUCTIONS[issue.severity] || 5;
    overallScore -= penalty;

    if (issue.category === 'SECURITY') {
      securityScore -= penalty;
    } else if (issue.category === 'PERFORMANCE') {
      performanceScore -= penalty;
    } else if (issue.category === 'COMPLEXITY') {
      complexityScore -= penalty;
    } else {
      qualityScore -= penalty;
    }
  });

  return {
    score: Math.max(0, Math.min(100, Math.round(overallScore))),
    breakdown: {
      security: Math.max(0, Math.min(100, Math.round(securityScore))),
      quality: Math.max(0, Math.min(100, Math.round(qualityScore))),
      performance: Math.max(0, Math.min(100, Math.round(performanceScore))),
      complexity: Math.max(0, Math.min(100, Math.round(complexityScore))),
    },
    metrics,
    issues: sortedIssues,
    summary: calculateSummary(sortedIssues),
    metadata: baseMetadata,
  };
}
