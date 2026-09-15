/**
 * Deterministic Issue Deduplicator.
 * Identifies and removes duplicate or overlapping findings between Static AST analysis and Gemini AI analysis.
 *
 * Core Principle:
 * Static findings are deterministic and trusted baseline; Static findings ALWAYS win conflicts.
 */

// High-signal domain keywords that indicate identical defect concepts
const HIGH_SIGNAL_KEYWORDS = new Set([
  'secret',
  'credential',
  'token',
  'password',
  'apikey',
  'api_key',
  'sql',
  'injection',
  'sqli',
  'eval',
  'innerhtml',
  'dangerouslysetinnerhtml',
  'cleanup',
  'removeeventlistener',
  'addeventlistener',
  'dependency',
  'useeffect',
  'key',
  'index',
  'catch',
  'nesting',
  'complexity',
  'cyclomatic',
]);

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is',
  'are', 'was', 'were', 'it', 'its', 'be', 'this', 'that', 'with', 'from',
  'by', 'as', 'not', 'code', 'function', 'variable', 'use', 'using',
]);

/**
 * Extracts a normalized set of semantic keywords from text.
 * @param {string} text
 * @returns {Set<string>}
 */
function extractKeywords(text = '') {
  const words = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Checks if two line spans overlap or are within close proximity (<= 2 lines).
 */
function areLinesNearby(issueA, issueB, maxDistance = 2) {
  const startA = issueA.line || 1;
  const endA = issueA.endLine || startA;
  const startB = issueB.line || 1;
  const endB = issueB.endLine || startB;

  // Direct overlap
  const overlaps = Math.max(startA, startB) <= Math.min(endA, endB);
  if (overlaps) return true;

  // Proximity: distance between start lines or edges <= maxDistance
  const distance = Math.min(
    Math.abs(startA - startB),
    Math.abs(startA - endB),
    Math.abs(endA - startB)
  );

  return distance <= maxDistance;
}

/**
 * Checks if an AI finding duplicates an existing static finding.
 *
 * @param {object} staticIssue Deterministic static issue
 * @param {object} aiIssue AI semantic issue
 * @returns {boolean} True if aiIssue is a duplicate of staticIssue
 */
export function isDuplicate(staticIssue, aiIssue) {
  const nearby = areLinesNearby(staticIssue, aiIssue, 2);
  if (!nearby) {
    return false;
  }

  // 1. Same category check
  const sameCategory = staticIssue.category === aiIssue.category;

  // 2. Token overlap analysis
  const staticTokens = extractKeywords(`${staticIssue.title} ${staticIssue.description}`);
  const aiTokens = extractKeywords(`${aiIssue.title} ${aiIssue.description}`);

  let sharedHighSignal = 0;
  let sharedGeneral = 0;

  for (const token of aiTokens) {
    if (staticTokens.has(token)) {
      if (HIGH_SIGNAL_KEYWORDS.has(token)) {
        sharedHighSignal++;
      } else {
        sharedGeneral++;
      }
    }
  }

  // If nearby lines share a high-signal keyword (e.g. "secret", "sql", "cleanup"), it is a duplicate
  if (sharedHighSignal >= 1) {
    return true;
  }

  // If nearby lines share category AND general keywords
  if (sameCategory && sharedGeneral >= 2) {
    return true;
  }

  // If lines directly overlap and category matches
  const directOverlap = Math.max(staticIssue.line, aiIssue.line) <= Math.min(staticIssue.endLine, aiIssue.endLine);
  if (directOverlap && sameCategory && (sharedGeneral >= 1 || staticIssue.rule.startsWith('SEC-') && aiIssue.rule === 'AI-SECURITY')) {
    return true;
  }

  return false;
}

/**
 * Deduplicates AI findings against static findings.
 * Static findings are fully preserved. Any AI finding that describes the same defect as a static finding is pruned.
 *
 * @param {Array} staticIssues Array of static issues.
 * @param {Array} aiIssues Array of normalized AI issues.
 * @returns {{ deduplicatedAiIssues: Array, droppedAiCount: number }}
 */
export function deduplicateAiAgainstStatic(staticIssues = [], aiIssues = []) {
  if (!Array.isArray(aiIssues) || aiIssues.length === 0) {
    return { deduplicatedAiIssues: [], droppedAiCount: 0 };
  }

  const keptAi = [];
  let droppedCount = 0;

  for (const aiIssue of aiIssues) {
    const hasStaticDuplicate = staticIssues.some((staticIssue) =>
      isDuplicate(staticIssue, aiIssue)
    );

    if (hasStaticDuplicate) {
      droppedCount++;
    } else {
      // Also check against already kept AI issues to avoid intra-AI duplication on same line/rule
      const hasAiDuplicate = keptAi.some((kept) =>
        kept.line === aiIssue.line && kept.rule === aiIssue.rule
      );

      if (hasAiDuplicate) {
        droppedCount++;
      } else {
        keptAi.push(aiIssue);
      }
    }
  }

  return {
    deduplicatedAiIssues: keptAi,
    droppedAiCount: droppedCount,
  };
}
