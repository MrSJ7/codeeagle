/**
 * Source Context Formatting Utility for Gemini Grounding.
 * Converts raw source code into deterministically numbered lines for AI context,
 * ensuring precise 1-based line number references.
 */

/**
 * Transforms source code into 1-based numbered lines.
 * Example:
 * 1 | const x = 1;
 * 2 | console.log(x);
 *
 * @param {string} code Raw source code string.
 * @returns {string} Numbered source string.
 */
export function formatNumberedSource(code = '') {
  if (typeof code !== 'string' || !code) return '';
  const lines = code.split('\n');
  return lines.map((line, idx) => `${idx + 1} | ${line}`).join('\n');
}

/**
 * Returns the line count of the source code.
 * @param {string} code Raw source code string.
 * @returns {number} Line count.
 */
export function getSourceLineCount(code = '') {
  if (typeof code !== 'string' || !code) return 0;
  return code.split('\n').length;
}
