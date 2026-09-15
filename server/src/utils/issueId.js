/**
 * Deterministic Issue ID Generator.
 * Derives unique, human-readable IDs from canonical issue attributes without randomness or timestamps.
 */
import crypto from 'crypto';

/**
 * Generates a deterministic ID for an issue.
 *
 * Requirements:
 * - Deterministic: same inputs always produce the same ID
 * - Static IDs (e.g. SEC-SECRET-6) and AI IDs (e.g. AI-LOGIC-12-a8f2) never collide
 * - Human-readable for debugging
 *
 * @param {object} params
 * @param {'STATIC'|'AI'} params.source Source of the issue
 * @param {string} params.rule Normalized rule name
 * @param {number} params.line 1-based start line
 * @param {number} params.endLine 1-based end line
 * @param {string} params.title Finding title
 * @param {number} [params.index=0] Optional sequence index for collision resolution
 * @returns {string} Deterministic ID
 */
export function generateIssueId({
  source = 'STATIC',
  rule = 'RULE',
  line = 1,
  endLine = 1,
  title = '',
  index = 0,
}) {
  const normSource = String(source).toUpperCase();
  const normRule = String(rule).toUpperCase();
  const safeLine = Math.max(1, Number.isInteger(line) ? line : 1);
  const safeEndLine = Math.max(safeLine, Number.isInteger(endLine) ? endLine : safeLine);
  const normTitle = String(title).trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const contentSignature = `${normSource}|${normRule}|${safeLine}|${safeEndLine}|${normTitle}|${index}`;
  const shortHash = crypto
    .createHash('sha256')
    .update(contentSignature)
    .digest('hex')
    .slice(0, 4);

  if (normSource === 'STATIC') {
    return `${normRule}-${safeLine}`;
  }

  // AI findings: e.g. AI-LOGIC-3-a8f2
  return `${normRule}-${safeLine}-${shortHash}`;
}
