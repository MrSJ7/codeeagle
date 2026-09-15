import { computeCodeHash } from '../utils/codeHasher.js';
import { countLines } from '../utils/sourceUtils.js';
import { RULE_REGISTRY } from '../analyzers/ruleRegistry.js';

export const PATCH_REASONS = {
  ORIGINAL_NOT_FOUND: 'ORIGINAL_NOT_FOUND',
  MULTIPLE_MATCHES: 'MULTIPLE_MATCHES',
  INVALID_LINE_RANGE: 'INVALID_LINE_RANGE',
  LINE_RANGE_MISMATCH: 'LINE_RANGE_MISMATCH',
  INVALID_FIX: 'INVALID_FIX',
  STALE_SOURCE: 'STALE_SOURCE',
  UNSUPPORTED_SOURCE: 'UNSUPPORTED_SOURCE',
  UNSAFE_AI_FIX: 'UNSAFE_AI_FIX',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  REPLACEMENT_TOO_LARGE: 'REPLACEMENT_TOO_LARGE',
  SPAN_TOO_LARGE: 'SPAN_TOO_LARGE',
};

export const MAX_REPLACEMENT_LENGTH = 50000;

/**
 * Pure string mutation helper that splices replacement in place of original.
 * Never executes code. Pure substring manipulation.
 */
export function applyStringPatch({ code, original, replacement, firstIndex }) {
  return code.slice(0, firstIndex) + replacement + code.slice(firstIndex + original.length);
}

/**
 * Validates a patch candidate against source code and issue metadata.
 *
 * @param {Object} params
 * @param {string} params.code - Current source code in editor
 * @param {string} [params.codeHash] - Expected hash of source that produced the issue
 * @param {Object} params.issue - Canonical issue object
 * @returns {Object} Canonical verification result
 */
export function verifyPatch({ code, codeHash, issue }) {
  if (typeof code !== 'string') {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  if (!issue || typeof issue !== 'object') {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  // AI issues are strictly manual/copy-only
  if (issue.source === 'AI') {
    return { applicable: false, reason: PATCH_REASONS.UNSAFE_AI_FIX };
  }

  // Only STATIC issues can be patched automatically
  if (issue.source !== 'STATIC') {
    return { applicable: false, reason: PATCH_REASONS.UNSUPPORTED_SOURCE };
  }

  // Validate rule in registry
  if (!issue.rule || !RULE_REGISTRY[issue.rule]) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  // Validate issue fix structure
  if (!issue.fix || typeof issue.fix !== 'object') {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  const { original, replacement } = issue.fix;
  if (typeof original !== 'string' || original.length === 0) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  if (typeof replacement !== 'string' || replacement.length > MAX_REPLACEMENT_LENGTH) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_FIX };
  }

  // Validate line boundaries
  const totalLines = countLines(code);
  const line = typeof issue.line === 'number' ? Math.floor(issue.line) : -1;
  const endLine = typeof issue.endLine === 'number' ? Math.floor(issue.endLine) : line;

  if (line < 1 || endLine < line || endLine > totalLines) {
    return { applicable: false, reason: PATCH_REASONS.INVALID_LINE_RANGE };
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

  if (matchStartLine > endLine || matchEndLine < line) {
    return { applicable: false, reason: PATCH_REASONS.LINE_RANGE_MISMATCH };
  }

  if (Math.abs(matchStartLine - line) > 1) {
    return { applicable: false, reason: PATCH_REASONS.LINE_RANGE_MISMATCH };
  }

  // Calculate hashes and generate patched string via safe substring slicing
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
  };
}

/**
 * Applies a verified patch safely to source code.
 *
 * @param {Object} params
 * @param {string} params.code
 * @param {string} [params.codeHash]
 * @param {Object} params.issue
 * @returns {Object} Application result
 */
export function applyPatch({ code, codeHash, issue }) {
  const verification = verifyPatch({ code, codeHash, issue });

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
