import path from "node:path";
import { PROJECT_LIMITS } from "../config/limits.js";
import { parseGitignore, isPathGitignored } from "../utils/gitignore.js";

// Directory names completely excluded from project analysis (modules, build, cache, VCS)
const IGNORED_DIRECTORY_NAMES = new Set([
  "node_modules",
  "bower_components",
  "jspm_packages",
  "vendor",
  ".yarn",
  ".pnp",
  "dist",
  "build",
  "coverage",
  ".nyc_output",
  ".cache",
  ".vite",
  ".next",
  ".nuxt",
  "out",
  "tmp",
  "temp",
  ".turbo",
  ".vercel",
  ".netlify",
  ".idea",
  ".vscode",
  ".git",
  ".svn",
  ".hg",
  "target",
  "bin",
  "obj",
  "lib-cov",
  ".github",
  ".husky",
  ".output",
  ".storybook",
  "storybook-static",
  ".svelte-kit",
  ".angular",
  ".docusaurus",
  "scripts",
  "test",
  "tests",
  "__tests__",
  "__mocks__",
  "fixtures",
  "spec",
  "specs",
  "e2e",
  "cypress",
  "playwright",
]);

// Lockfiles and generated metadata to skip from code analysis
const IGNORED_FILE_NAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  ".pnp.js",
  ".pnp.cjs",
  "npm-debug.log",
  "yarn-debug.log",
  "yarn-error.log",
  ".DS_Store",
  "Thumbs.db",
]);

/**
 * Checks if a file is a lockfile or package metadata file that should never be analyzed.
 */
export function isLockOrMetadataFile(filename) {
  if (IGNORED_FILE_NAMES.has(filename)) return true;
  const lower = filename.toLowerCase();
  return (
    lower.endsWith(".lock") ||
    lower.endsWith("-lock.json") ||
    lower.endsWith(".lockb") ||
    lower === "skills-lock.json"
  );
}

/**
 * Checks if a file is a TypeScript declaration file.
 */
export function isDeclarationFile(filename) {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith(".d.ts") ||
    lower.endsWith(".d.mts") ||
    lower.endsWith(".d.cts")
  );
}

/**
 * Checks if a file is a minified or generated bundle.
 */
export function isMinifiedFile(filename) {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith(".min.js") ||
    lower.endsWith(".min.mjs") ||
    lower.endsWith(".min.css") ||
    lower.endsWith(".bundle.js") ||
    lower.endsWith(".chunk.js")
  );
}

/**
 * Checks if a file is a test or spec file that should be excluded from production code review.
 */
export function isTestFile(filename) {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith(".test.js") ||
    lower.endsWith(".test.jsx") ||
    lower.endsWith(".test.ts") ||
    lower.endsWith(".test.tsx") ||
    lower.endsWith(".test.mjs") ||
    lower.endsWith(".spec.js") ||
    lower.endsWith(".spec.jsx") ||
    lower.endsWith(".spec.ts") ||
    lower.endsWith(".spec.tsx") ||
    lower.endsWith(".spec.mjs")
  );
}

/**
 * Checks if a file is a build or tooling configuration file (e.g. eslint, postcss, tailwind, drizzle, vite).
 */
export function isToolingConfigFile(filename) {
  const lower = filename.toLowerCase();
  return (
    lower.startsWith("eslint.config.") ||
    lower.startsWith("postcss.config.") ||
    lower.startsWith("tailwind.config.") ||
    lower.startsWith("prettier.config.") ||
    lower.startsWith("drizzle.config.") ||
    lower.startsWith("vite.config.") ||
    lower.startsWith("vitest.config.") ||
    lower.startsWith("jest.config.") ||
    lower.startsWith("playwright.config.") ||
    lower.startsWith("webpack.config.") ||
    lower.startsWith("rollup.config.") ||
    lower.startsWith("babel.config.") ||
    lower.startsWith("commitlint.config.") ||
    lower === "components.json"
  );
}

// Binary file extensions
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".tiff", ".svg",
  ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar",
  ".mp4", ".mov", ".avi", ".webm", ".mkv",
  ".mp3", ".wav", ".ogg", ".flac", ".m4a",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".exe", ".dll", ".so", ".dylib", ".bin", ".iso",
  ".pyc", ".class", ".wasm", ".jar", ".map",
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
 * Extracts and compiles gitignore rules from project files list.
 * @param {Array<{ path: string, content?: string | null }>} rawFiles
 * @returns {Array<{ regex: RegExp, isNegated: boolean, original: string }>}
 */
export function extractProjectGitignoreRules(rawFiles = []) {
  const rules = [];
  for (const file of rawFiles) {
    if (file.path === '.gitignore' || file.path.endsWith('/.gitignore')) {
      if (typeof file.content === 'string') {
        const parsed = parseGitignore(file.content);
        rules.push(...parsed);
      }
    }
  }
  return rules;
}

/**
 * Classifies a file inside a project.
 *
 * @param {string} relativePath POSIX relative path
 * @param {number} size File size in bytes
 * @param {Array} [gitignoreRules] Compiled gitignore rules
 * @returns {{
 *   status: "ELIGIBLE" | "SKIPPED",
 *   language: string,
 *   extension: string,
 *   skipReason: null | "IGNORED_DIRECTORY" | "SENSITIVE_FILE" | "BINARY_FILE" | "FILE_TOO_LARGE" | "UNSUPPORTED_LANGUAGE",
 *   skipMessage: string | null
 * }}
 */
export function classifyProjectFile(relativePath, size = 0, gitignoreRules = []) {
  const filename = path.basename(relativePath);
  const ext = path.extname(filename).toLowerCase();

  // 1. Check custom .gitignore patterns if present
  if (isPathGitignored(relativePath, gitignoreRules)) {
    return {
      status: "SKIPPED",
      language: "ignored",
      extension: ext,
      skipReason: "IGNORED_DIRECTORY",
      skipMessage: "Skipped via .gitignore",
    };
  }

  // 2. Check ignored directory
  if (isIgnoredDirectory(relativePath)) {
    return {
      status: "SKIPPED",
      language: "ignored",
      extension: ext,
      skipReason: "IGNORED_DIRECTORY",
      skipMessage: "Ignored build or dependency directory",
    };
  }

  // 3. Check ignored lockfile / metadata
  if (isLockOrMetadataFile(filename)) {
    return {
      status: "SKIPPED",
      language: "metadata",
      extension: ext,
      skipReason: "IGNORED_DIRECTORY",
      skipMessage: "Ignored lockfile or system file",
    };
  }

  // 4. Sensitive file check
  if (isSensitiveFile(filename)) {
    return {
      status: "SKIPPED",
      language: "sensitive",
      extension: ext,
      skipReason: "SENSITIVE_FILE",
      skipMessage: "Skipped sensitive file",
    };
  }

  // 5. Binary check
  if (isBinaryFile(filename)) {
    return {
      status: "SKIPPED",
      language: "binary",
      extension: ext,
      skipReason: "BINARY_FILE",
      skipMessage: "Binary asset",
    };
  }

  // 6. Minified or generated bundle check
  if (isMinifiedFile(filename)) {
    return {
      status: "SKIPPED",
      language: "minified",
      extension: ext,
      skipReason: "MINIFIED_FILE",
      skipMessage: "Generated or minified bundle",
    };
  }

  // 7. TypeScript declaration file check
  if (isDeclarationFile(filename)) {
    return {
      status: "SKIPPED",
      language: "typescript",
      extension: ext,
      skipReason: "DECLARATION_FILE",
      skipMessage: "TypeScript declaration file",
    };
  }

  // 8. Test file exclusion
  if (isTestFile(filename)) {
    return {
      status: "SKIPPED",
      language: "test",
      extension: ext,
      skipReason: "TEST_FILE",
      skipMessage: "Test file (excluded from production code review)",
    };
  }

  // 9. Tooling configuration file check
  if (isToolingConfigFile(filename)) {
    return {
      status: "SKIPPED",
      language: "config",
      extension: ext,
      skipReason: "CONFIG_FILE",
      skipMessage: "Build or tooling configuration file",
    };
  }

  // 10. File size limits
  if (size > PROJECT_LIMITS.MAX_SOURCE_FILE_BYTES) {
    return {
      status: "SKIPPED",
      language: "unsupported",
      extension: ext,
      skipReason: "FILE_TOO_LARGE",
      skipMessage: `File size exceeds 1 MB limit (${Math.round(size / 1024)} KB)`,
    };
  }

  // 11. Language support check
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

  if (ext === ".ts" || ext === ".mts" || ext === ".cts") {
    return {
      status: "ELIGIBLE",
      language: "typescript",
      extension: ext,
      skipReason: null,
      skipMessage: null,
    };
  }

  if (ext === ".tsx") {
    return {
      status: "ELIGIBLE",
      language: "tsx",
      extension: ext,
      skipReason: null,
      skipMessage: null,
    };
  }

  if (ext === ".ejs") {
    return {
      status: "ELIGIBLE",
      language: "ejs",
      extension: ext,
      skipReason: null,
      skipMessage: null,
    };
  }

  if (filename === "package.json") {
    return {
      status: "ELIGIBLE",
      language: "json",
      extension: ext,
      skipReason: null,
      skipMessage: null,
    };
  }

  if (ext === ".json") {
    return {
      status: "SKIPPED",
      language: "json",
      extension: ext,
      skipReason: "CONFIG_FILE",
      skipMessage: "Configuration file (only package.json is audited for dependencies)",
    };
  }

  // Supported source tree representation for non-JS files
  const langMap = {
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
