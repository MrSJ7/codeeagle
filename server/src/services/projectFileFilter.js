import path from "node:path";
import { PROJECT_LIMITS } from "../config/limits.js";

// Directory names completely excluded from project analysis
const IGNORED_DIRECTORY_NAMES = new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  "dist",
  "build",
  "coverage",
  ".nyc_output",
  ".cache",
  ".vite",
  ".next",
  ".nuxt",
  "out",
  "vendor",
  "tmp",
  "temp",
  ".turbo",
  ".vercel",
  ".netlify",
  ".idea",
  ".vscode",
]);

// Lockfiles and generated metadata to skip from code analysis
const IGNORED_FILE_NAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "npm-debug.log",
  "yarn-debug.log",
  "yarn-error.log",
  ".DS_Store",
  "Thumbs.db",
]);

// Binary file extensions
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".tiff", ".svg",
  ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar",
  ".mp4", ".mov", ".avi", ".webm", ".mkv",
  ".mp3", ".wav", ".ogg", ".flac", ".m4a",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".exe", ".dll", ".so", ".dylib", ".bin", ".iso",
  ".pyc", ".class", ".wasm", ".jar",
]);

// Sensitive credential and environment files that MUST NOT be analyzed or leaked
const SENSITIVE_PATTERNS = [
  /^.env(..+)?$/i,
  /^id_rsa/i,
  /^id_ed25519/i,
  /^id_dsa/i,
  /.pem$/i,
  /.key$/i,
  /.p12$/i,
  /.pfx$/i,
  /^credentials.json$/i,
  /^service[-_]account.*.json$/i,
  /secret/i,
  /auth_token/i,
];

/**
 * Checks if a relative path belongs to an ignored directory.
 */
export function isIgnoredDirectory(relativePath) {
  const parts = relativePath.split("/");
  for (let i = 0; i < parts.length - 1; i++) {
    if (IGNORED_DIRECTORY_NAMES.has(parts[i].toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a file is sensitive / confidential.
 */
export function isSensitiveFile(filename) {
  const base = path.basename(filename);
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(base));
}

/**
 * Checks if a file has a binary extension.
 */
export function isBinaryFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Classifies a file inside a project.
 *
 * @param {string} relativePath POSIX relative path
 * @param {number} size File size in bytes
 * @returns {{
 *   status: "ELIGIBLE" | "SKIPPED",
 *   language: string,
 *   extension: string,
 *   skipReason: null | "IGNORED_DIRECTORY" | "SENSITIVE_FILE" | "BINARY_FILE" | "FILE_TOO_LARGE" | "UNSUPPORTED_LANGUAGE",
 *   skipMessage: string | null
 * }}
 */
export function classifyProjectFile(relativePath, size = 0) {
  const filename = path.basename(relativePath);
  const ext = path.extname(filename).toLowerCase();

  // 1. Check ignored directory
  if (isIgnoredDirectory(relativePath)) {
    return {
      status: "SKIPPED",
      language: "ignored",
      extension: ext,
      skipReason: "IGNORED_DIRECTORY",
      skipMessage: "Ignored build or dependency directory",
    };
  }

  // 2. Check ignored lockfile / metadata
  if (IGNORED_FILE_NAMES.has(filename)) {
    return {
      status: "SKIPPED",
      language: "metadata",
      extension: ext,
      skipReason: "IGNORED_DIRECTORY",
      skipMessage: "Ignored lockfile or system file",
    };
  }

  // 3. Sensitive file check
  if (isSensitiveFile(filename)) {
    return {
      status: "SKIPPED",
      language: "sensitive",
      extension: ext,
      skipReason: "SENSITIVE_FILE",
      skipMessage: "Skipped sensitive file",
    };
  }

  // 4. Binary check
  if (isBinaryFile(filename)) {
    return {
      status: "SKIPPED",
      language: "binary",
      extension: ext,
      skipReason: "BINARY_FILE",
      skipMessage: "Binary asset",
    };
  }

  // 5. File size limits
  if (size > PROJECT_LIMITS.MAX_SOURCE_FILE_BYTES) {
    return {
      status: "SKIPPED",
      language: "unsupported",
      extension: ext,
      skipReason: "FILE_TOO_LARGE",
      skipMessage: `File size exceeds 1 MB limit (${Math.round(size / 1024)} KB)`,
    };
  }

  // 6. Language support check
  if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
    return {
      status: "ELIGIBLE",
      language: "javascript",
      extension: ext,
      skipReason: null,
      skipMessage: null,
    };
  }

  if (ext === ".jsx") {
    return {
      status: "ELIGIBLE",
      language: "jsx",
      extension: ext,
      skipReason: null,
      skipMessage: null,
    };
  }

  // Supported source tree representation for non-JS files
  const langMap = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".json": "json",
    ".md": "markdown",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".py": "python",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".sql": "sql",
    ".sh": "shell",
  };

  return {
    status: "SKIPPED",
    language: langMap[ext] || "plaintext",
    extension: ext,
    skipReason: "UNSUPPORTED_LANGUAGE",
    skipMessage: "Unsupported file type",
  };
}
