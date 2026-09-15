/**
 * Source line and text extraction utilities.
 * Handles 1-based line indexing safely and guarantees source integrity.
 */

export function countLines(code = '') {
  if (!code) return 0;
  return code.split('\n').length;
}

export function getLine(code = '', lineNumber = 1) {
  if (!code || lineNumber < 1) return '';
  const lines = code.split('\n');
  return lines[lineNumber - 1] ?? '';
}

export function getLineRange(code = '', startLine = 1, endLine = 1) {
  if (!code || startLine < 1) return '';
  const lines = code.split('\n');
  const safeStart = Math.max(1, startLine) - 1;
  const safeEnd = Math.min(lines.length, Math.max(safeStart + 1, endLine));
  return lines.slice(safeStart, safeEnd).join('\n');
}

export function getNodeSource(code = '', node) {
  if (!code || !node) return '';

  if (typeof node.start === 'number' && typeof node.end === 'number') {
    return code.slice(node.start, node.end);
  }

  if (node.loc) {
    return getLineRange(code, node.loc.start.line, node.loc.end.line);
  }

  return '';
}

/**
 * Validates that fix.original exists verbatim within the source code.
 * If there is any mismatch or formatting discrepancy, returns null.
 */
export function verifyFixSnippet(code = '', fix) {
  if (!fix || typeof fix !== 'object') return null;
  if (!fix.original || typeof fix.original !== 'string') return null;
  if (!code.includes(fix.original)) return null;

  return {
    original: fix.original,
    replacement: fix.replacement || '',
  };
}
