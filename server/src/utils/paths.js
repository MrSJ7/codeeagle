import path from "node:path";
import crypto from "node:crypto";

/**
 * Normalizes an arbitrary relative file path to safe POSIX format.
 * Strips leading/trailing slashes, resolves relative segments, and rejects directory traversal.
 *
 * @param {string} rawPath
 * @returns {string} Normalized POSIX path (e.g. "src/components/Button.jsx")
 * @throws {Error} If path is absolute, contains null bytes, or escapes project root
 */
export function normalizeSafeRelativePath(rawPath) {
  if (typeof rawPath !== "string" || !rawPath.trim()) {
    throw new Error("Path must be a non-empty string");
  }

  // Reject null bytes and suspicious control characters
  if (rawPath.includes("\0")) {
    throw new Error("Invalid path: contains null byte");
  }

  // Normalize backslashes to forward slashes
  let sanitized = rawPath.replace(/\\/g, "/").trim();

  // Strip leading slashes to prevent absolute interpretation
  sanitized = sanitized.replace(/^\/+/, "");

  // Normalize segments
  const segments = sanitized.split("/").filter(Boolean);
  const stack = [];

  for (const segment of segments) {
    if (segment === ".") {
      continue;
    }
    if (segment === "..") {
      if (stack.length === 0) {
        throw new Error(`Path traversal detected: "${rawPath}" escapes project root`);
      }
      stack.pop();
    } else {
      // Reject Windows drive letters like C:
      if (/^[a-zA-Z]:$/.test(segment)) {
        throw new Error(`Invalid path segment: "${segment}"`);
      }
      stack.push(segment);
    }
  }

  if (stack.length === 0) {
    throw new Error("Path resolves to empty root");
  }

  return stack.join("/");
}

/**
 * Validates that an extraction destination stays strictly within target directory (Zip Slip defense).
 *
 * @param {string} baseDir Base extraction directory
 * @param {string} relativePath Relative path inside archive
 * @returns {string} Fully resolved absolute target path
 */
export function resolveSafeExtractionPath(baseDir, relativePath) {
  const safeRelative = normalizeSafeRelativePath(relativePath);
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, safeRelative);

  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error(`Zip Slip attempt detected: "${relativePath}" escapes target directory`);
  }

  return resolvedTarget;
}

/**
 * Computes a deterministic SHA-256 fingerprint for a collection of project files.
 * Canonical sort order ensures identical project content always produces identical hash.
 *
 * @param {Array<{path: string, contentHash?: string, content?: string}>} files
 * @returns {string} 64-char SHA-256 hex string
 */
export function computeProjectSourceHash(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return crypto.createHash("sha256").update("").digest("hex");
  }

  const sorted = [...files].sort((a, b) => (a.path || "").localeCompare(b.path || ""));
  const hash = crypto.createHash("sha256");

  for (const file of sorted) {
    const filePath = file.path || "";
    const fileHash = file.contentHash || (file.content ? crypto.createHash("sha256").update(file.content).digest("hex") : "");
    hash.update(`${filePath}:${fileHash}\n`);
  }

  return hash.digest("hex");
}
