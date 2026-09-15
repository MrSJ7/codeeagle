/**
 * Review Orchestrator Service.
 * Coordinates deterministic static analysis with optional Google Gemini semantic analysis,
 * executing defensive validation, deduplication, canonical ID assignment, and final scoring.
 */
import { analyzeCode, normalizeLanguage } from '../analyzers/analyzeCode.js';
import { analyzeCodeWithGemini } from './geminiService.js';
import { normalizeAiFindings } from './issueNormalizer.js';
import { deduplicateAiAgainstStatic } from './issueDeduplicator.js';
import { calculateScores, calculateSummary } from './scoreCalculator.js';

const SEVERITY_ORDER = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

/**
 * Deterministically sorts merged canonical issues:
 * 1. Severity rank (CRITICAL -> HIGH -> MEDIUM -> LOW)
 * 2. Source line ascending
 * 3. Rule name ascending
 * 4. ID ascending
 */
function sortMergedIssues(issues = []) {
  return [...issues].sort((a, b) => {
    const rankA = SEVERITY_ORDER[a.severity] ?? 99;
    const rankB = SEVERITY_ORDER[b.severity] ?? 99;
    if (rankA !== rankB) return rankA - rankB;

    if (a.line !== b.line) return a.line - b.line;

    const ruleCompare = (a.rule || '').localeCompare(b.rule || '');
    if (ruleCompare !== 0) return ruleCompare;

    return (a.id || '').localeCompare(b.id || '');
  });
}

/**
 * Orchestrates full review pipeline for supplied source code.
 *
 * Flow:
 * 1. Deterministic static AST analysis (always runs first).
 * 2. If syntax error: return static syntax review immediately.
 * 3. Call optional Gemini semantic analysis with static findings context.
 * 4. If Gemini succeeds: validate, normalize, deduplicate, merge, recalculate score.
 * 5. If Gemini fails/unavailable: gracefully fallback to static findings and score.
 *
 * @param {object} params
 * @param {string} params.code Raw source code.
 * @param {string} params.language Language string ('javascript' or 'jsx').
 * @param {string} params.filename Target filename.
 * @returns {Promise<object>} Canonical review response.
 */
export async function reviewCode({
  code = '',
  language = 'javascript',
  filename = 'source.js',
}) {
  const normalizedLang = normalizeLanguage(language);

  // 1. Run deterministic static AST analysis
  const staticResult = analyzeCode(code, normalizedLang, filename);

  // If code contains syntax errors, return static review immediately
  const hasSyntaxError = staticResult.issues.some((i) => i.rule === 'SYNTAX');
  if (hasSyntaxError) {
    return {
      ...staticResult,
      metadata: {
        ...staticResult.metadata,
        aiStatus: 'UNAVAILABLE',
      },
    };
  }

  // 2. Call optional Gemini semantic engine
  let aiResult = null;
  try {
    aiResult = await analyzeCodeWithGemini({
      code,
      language: normalizedLang,
      filename,
      staticIssues: staticResult.issues,
      metrics: staticResult.metrics,
    });
  } catch (err) {
    console.error('[ReviewService] Unexpected error invoking Gemini:', err.message);
    aiResult = { status: 'UNAVAILABLE', data: null, error: err.message };
  }

  // 3. Handle Gemini result: Fallback to static if unavailable or failed validation
  if (!aiResult || aiResult.status !== 'SUCCESS' || !aiResult.data) {
    const aiStatus = aiResult?.status === 'VALIDATION_FAILED' ? 'VALIDATION_FAILED' : 'UNAVAILABLE';
    return {
      ...staticResult,
      metadata: {
        ...staticResult.metadata,
        engine: 'static',
        aiStatus,
      },
    };
  }

  // 4. Normalize and canonicalize AI findings
  const normalizedAiIssues = normalizeAiFindings(aiResult.data.findings);

  // 5. Deduplicate AI findings against static baseline (Static always wins conflicts)
  const { deduplicatedAiIssues } = deduplicateAiAgainstStatic(
    staticResult.issues,
    normalizedAiIssues
  );

  // 6. Merge static findings with surviving unique AI findings
  const mergedIssues = sortMergedIssues([
    ...staticResult.issues,
    ...deduplicatedAiIssues,
  ]);

  // 7. Calculate final score, breakdown, and summary strictly from final merged issues
  const { score, breakdown } = calculateScores(mergedIssues, false);
  const summary = calculateSummary(mergedIssues);

  // 8. Return canonical hybrid review response
  return {
    score,
    breakdown,
    metrics: staticResult.metrics,
    issues: mergedIssues,
    summary,
    metadata: {
      engine: 'hybrid',
      aiStatus: 'USED',
      language: normalizedLang,
      filename,
      codeHash: staticResult.metadata.codeHash,
    },
  };
}
