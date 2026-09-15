import { computeCodeHash } from '../utils/codeHasher.js';
import { countLines } from '../utils/sourceUtils.js';
import { PATCH_REASONS, MAX_REPLACEMENT_LENGTH, applyStringPatch } from './patchService.js';

export const MIN_AI_CONFIDENCE = 0.80;
export const MAX_AFFECTED_LINES = 30;

const VALID_CATEGORIES = ['SECURITY', 'QUALITY', 'PERFORMANCE', 'COMPLEXITY'];
const VALID_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Dedicated verification service for AI-generated fixes.
 * Enforces defense-in-depth criteria:
 * 1. issue.source === "AI"
 * 2. fix object exists with non-empty original and valid replacement
 * 3. Confidence meets minimum threshold (>= 0.80)
 * 4. Rule, category, and severity are well-formed
 * 5. Replacement size <= 50 KB
 * 6. Line span <= 30 lines
 * 7. Stale-source check (SHA-256 match)
 * 8. Exactly one occurrence of original snippet in code
 * 9. Line range corroboration between AST report and verbatim match
 * 10. Pure text mutation delegated to patchService
 *
 * @param {Object} params
 * @param {string} params.code - Current source code in editor
 * @param {string} [params.codeHash] - Expected source hash
 * @param {Object} params.issue - Canonical AI issue candidate
 * @returns {Object} Canonical AI verification result
 */
export function verifyAiPatch({ code, codeHash, issue }) {
  if (typeof code !== 'string') {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  if (!issue || typeof issue !== 'object') {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  // Strictly enforce AI source
  if (issue.source !== 'AI') {
    return { applicable: false, reason: PATCH_REASONS.UNSAFE_AI_FIX };
  }

  // Validate issue fix structure
  if (!issue.fix || typeof issue.fix !== 'object') {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  const { original, replacement } = issue.fix;
  if (typeof original !== 'string' || original.length === 0) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  if (typeof replacement !== 'string') {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  if (replacement.length > MAX_REPLACEMENT_LENGTH) {
    return { applicable: false, reason: PATCH_REASONS.REPLACEMENT_TOO_LARGE };
  }

  // Validate AI confidence threshold (>= 0.80)
  if (typeof issue.confidence !== 'number' || issue.confidence < MIN_AI_CONFIDENCE) {
    return { applicable: false, reason: PATCH_REASONS.LOW_CONFIDENCE };
  }

  // Validate AI rule, category, and severity
  if (typeof issue.rule !== 'string' || !issue.rule.trim()) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  if (!issue.category || !VALID_CATEGORIES.includes(issue.category)) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  if (!issue.severity || !VALID_SEVERITIES.includes(issue.severity)) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  // Validate line boundaries
  const totalLines = countLines(code);
  const line = typeof issue.line === 'number' ? Math.floor(issue.line) : -1;
  const endLine = typeof issue.endLine === 'number' ? Math.floor(issue.endLine) : line;

  if (line < 1 || endLine < line || endLine > totalLines) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_LINE_RANGE };
  }

  // Enforce maximum affected line span (conservative scope limit)
  if (endLine - line + 1 > MAX_AFFECTED_LINES) {
    return { applicable: false, reason: PATCH_REASONS.SPAN_TOO_LARGE };
  }

  // Stale-source protection: codeHash must match current code
  if (codeHash) {
    const currentCodeHash = computeCodeHash(code);
    if (currentCodeHash !== codeHash) {
      return { applicable: false, reason: PATCH_REASONS.STALE_SOURCE };
    }
  }

  // Exact matching: snippet must occur exactly once in code
  const firstIndex = code.indexOf(original);
  if (firstIndex === -1) {
    return { applicable: false, reason: PATCH_REASONS.ORIGINAL_NOT_FOUND };
  }

  const secondIndex = code.indexOf(original, firstIndex + 1);
  if (secondIndex !== -1) {
    return { applicable: false, reason: PATCH_REASONS.MULTIPLE_MATCHES };
  }

  // Line-range corroboration: snippet lines must correspond to issue lines
  const matchStartLine = code.slice(0, firstIndex).split('\n').length;
  const matchEndLine = code.slice(0, firstIndex + original.length).split('\n').length;
  const matchSpan = matchEndLine - matchStartLine + 1;

  if (matchSpan > MAX_AFFECTED_LINES) {
    return { applicable: false, reason: PATCH_REASONS.SPAN_TOO_LARGE };
  }

  if (matchStartLine > endLine || matchEndLine < line) {
    return { applicable: false, reason: PATCH_REASONS.LINE_RANGE_MISMATCH };
  }

  if (Math.abs(matchStartLine - line) > 1) {
    return { applicable: false, reason: PATCH_REASONS.LINE_RANGE_MISMATCH };
  }

  // Pure string mutation delegated to existing patchService helper
  const beforeHash = computeCodeHash(code);
  const patchedCode = applyStringPatch({ code, original, replacement, firstIndex });
  const afterHash = computeCodeHash(patchedCode);

  return {
    applicable: true,
    reason: null,
    original,
    replacement,
    startLine: matchStartLine,
    endLine: matchEndLine,
    beforeHash,
    afterHash,
    patchedCode,
    previewCode: patchedCode,
  };
}

/**
 * Applies a verified AI patch safely to source code.
 * Re-verifies all eligibility rules during application to prevent TOCTOU flaws.
 *
 * @param {Object} params
 * @param {string} params.code
 * @param {string} [params.codeHash]
 * @param {Object} params.issue
 * @returns {Object} Application result
 */
export function applyAiPatch({ code, codeHash, issue }) {
  const verification = verifyAiPatch({ code, codeHash, issue });

  if (!verification.applicable) {
    return {
      success: false,
      reason: verification.reason,
      patchedCode: null,
    };
  }

  return {
    success: true,
    reason: null,
    patchedCode: verification.patchedCode,
    beforeHash: verification.beforeHash,
    afterHash: verification.afterHash,
    issueId: issue.id,
    startLine: verification.startLine,
    endLine: verification.endLine,
  };
}
