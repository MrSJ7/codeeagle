/**
 * Gitignore pattern parser and path matcher.
 * Conforms to standard .gitignore matching semantics:
 * - Comments (#) and blank lines ignored
 * - Directory trailing slashes (e.g., node_modules/) match directories and their contents
 * - Leading slashes match relative to root
 * - Wildcards (*) and globstars (**) match path components
 * - Negation (!) support
 */

function patternToRegex(pattern) {
  let p = pattern.trim();
  if (!p || p.startsWith("#")) return null;

  const isNegated = p.startsWith("!");
  if (isNegated) p = p.slice(1);

  const isDirectoryOnly = p.endsWith("/");
  if (isDirectoryOnly) p = p.slice(0, -1);

  const isRootOnly = p.startsWith("/");
  if (isRootOnly) p = p.slice(1);

  // Escape special regex characters except * and ?
  let regexStr = p
    .replace(/[.+^$\{}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "___GLOBSTAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]")
    .replace(/___GLOBSTAR___/g, ".*");

  if (isRootOnly) {
    regexStr = "^" + regexStr;
  } else {
    regexStr = "(?:^|/)" + regexStr;
  }

  regexStr += "(?:/.*)?$";

  try {
    return {
      regex: new RegExp(regexStr),
      isNegated,
      original: pattern,
    };
  } catch {
    return null;
  }
}

export function parseGitignore(content) {
  if (!content || typeof content !== "string") return [];
  const lines = content.split(/\r?\n/);
  const rules = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const rule = patternToRegex(trimmed);
    if (rule) rules.push(rule);
  }

  return rules;
}

export function isPathGitignored(relativePath, rules = []) {
  if (!rules || rules.length === 0) return false;
  const cleanPath = relativePath.replace(/^\/+/, "");

  let isIgnored = false;
  for (const rule of rules) {
    if (rule.regex.test(cleanPath)) {
      isIgnored = !rule.isNegated;
    }
  }

  return isIgnored;
}
