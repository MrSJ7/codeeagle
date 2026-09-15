import crypto from 'node:crypto';

/**
 * Computes deterministic SHA-256 hex hash for source code version tracking.
 *
 * @param {string} code - Source code string
 * @returns {string} 64-character lowercase hex digest
 */
export function computeCodeHash(code = '') {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}
