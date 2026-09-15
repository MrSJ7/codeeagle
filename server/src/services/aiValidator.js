/**
 * AI Response Validator & Guardrails for Gemini Code Review Output.
 * Ensures model output complies with structural, spatial (line numbers),
 * and type constraints before it can be merged into canonical review findings.
 */
import { getSourceLineCount } from '../utils/sourceContext.js';

export const VALID_AI_SEVERITIES = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
export const VALID_AI_CATEGORIES = new Set(['SECURITY', 'QUALITY', 'PERFORMANCE', 'COMPLEXITY']);

/**
 * Validates and sanitizes a single AI finding.
 *
 * @param {object} finding Raw finding from Gemini.
 * @param {number} totalLines Total number of lines in source code.
 * @param {string} code Raw source code string.
 * @returns {{ valid: boolean, errors: string[], sanitized: object | null }}
 */
export function validateAiFinding(finding, totalLines = 1, code = '') {
  const errors = [];

  if (!finding || typeof finding !== 'object' || Array.isArray(finding)) {
    return { valid: false, errors: ['Finding must be a non-null object'], sanitized: null };
  }

  // 1. Rule identifier
  if (typeof finding.rule !== 'string' || !finding.rule.trim()) {
    errors.push('Finding "rule" must be a non-empty string');
  }

  // 2. Severity
  if (typeof finding.severity !== 'string' || !VALID_AI_SEVERITIES.has(finding.severity.toUpperCase())) {
    errors.push(`Finding "severity" must be one of ${Array.from(VALID_AI_SEVERITIES).join(', ')}, got: "${finding.severity}"`);
  }

  // 3. Category
  if (typeof finding.category !== 'string' || !VALID_AI_CATEGORIES.has(finding.category.toUpperCase())) {
    errors.push(`Finding "category" must be one of ${Array.from(VALID_AI_CATEGORIES).join(', ')}, got: "${finding.category}"`);
  }

  // 4. Title, Description, Recommendation
  if (typeof finding.title !== 'string' || !finding.title.trim()) {
    errors.push('Finding "title" must be a non-empty string');
  }
  if (typeof finding.description !== 'string' || !finding.description.trim()) {
    errors.push('Finding "description" must be a non-empty string');
  }
  if (typeof finding.recommendation !== 'string' || !finding.recommendation.trim()) {
    errors.push('Finding "recommendation" must be a non-empty string');
  }

  // 5. Line numbers grounding
  const isLineInt = Number.isInteger(finding.line);
  const isEndLineInt = Number.isInteger(finding.endLine);

  if (!isLineInt) {
    errors.push(`Finding "line" must be an integer, got: ${finding.line}`);
  } else if (finding.line < 1) {
    errors.push(`Finding "line" must be 1-based (>= 1), got: ${finding.line}`);
  } else if (finding.line > totalLines) {
    errors.push(`Finding "line" (${finding.line}) exceeds total source lines (${totalLines})`);
  }

  if (!isEndLineInt) {
    errors.push(`Finding "endLine" must be an integer, got: ${finding.endLine}`);
  } else if (isLineInt && finding.endLine < finding.line) {
    errors.push(`Finding "endLine" (${finding.endLine}) cannot be less than "line" (${finding.line})`);
  } else if (finding.endLine > totalLines) {
    errors.push(`Finding "endLine" (${finding.endLine}) exceeds total source lines (${totalLines})`);
  }

  // 6. Confidence score
  if (typeof finding.confidence !== 'number' || Number.isNaN(finding.confidence)) {
    errors.push(`Finding "confidence" must be a number, got: ${finding.confidence}`);
  } else if (finding.confidence < 0 || finding.confidence > 1) {
    errors.push(`Finding "confidence" must be between 0 and 1, got: ${finding.confidence}`);
  }

  // If any core property failed, reject the finding
  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }

  // 7. Fix handling: Information-only, set to null if invalid or not found in source
  let sanitizedFix = null;
  if (
    finding.fix &&
    typeof finding.fix === 'object' &&
    typeof finding.fix.original === 'string' &&
    typeof finding.fix.replacement === 'string' &&
    finding.fix.original.trim().length > 0
  ) {
    // Must exist verbatim in code
    if (code.includes(finding.fix.original)) {
      sanitizedFix = {
        original: finding.fix.original,
        replacement: finding.fix.replacement,
      };
    } else {
      // In accordance with Section 6 & 10: keep the finding, set fix to null
      sanitizedFix = null;
    }
  }

  // 8. Evidence extraction & grounding
  let evidence = null;
  if (typeof finding.evidence === 'string' && finding.evidence.trim() && code.includes(finding.evidence)) {
    evidence = finding.evidence.trim();
  } else if (code) {
    const lines = code.split('\n');
    const start = Math.max(0, finding.line - 1);
    const end = Math.min(lines.length, finding.endLine);
    evidence = lines.slice(start, end).join('\n').trim();
  }

  const category = finding.category.toUpperCase();
  const ruleClass = String(finding.ruleClass || (category === 'SECURITY' ? 'SECURITY' : category === 'PERFORMANCE' ? 'PERFORMANCE' : 'CORRECTNESS')).toUpperCase();
  const severity = finding.severity.toUpperCase();
  const impactWeight = typeof finding.impactWeight === 'number' ? finding.impactWeight : (
    severity === 'CRITICAL' ? 1.0 : severity === 'HIGH' ? 0.85 : severity === 'MEDIUM' ? 0.60 : 0.20
  );

  const sanitized = {
    rule: finding.rule.trim().toUpperCase(),
    severity,
    category,
    ruleClass,
    title: finding.title.trim(),
    line: finding.line,
    endLine: finding.endLine,
    description: finding.description.trim(),
    recommendation: finding.recommendation.trim(),
    confidence: Math.max(0, Math.min(1, finding.confidence)),
    evidence,
    relatedFiles: Array.isArray(finding.relatedFiles) ? finding.relatedFiles.filter((p) => typeof p === 'string') : [],
    impactWeight,
    fix: sanitizedFix,
  };

  return { valid: true, errors: [], sanitized };
}

/**
 * Filters AI findings based on confidence threshold and rejects cosmetic style noise.
 * 
 * @param {Array<object>} findings Validated AI findings
 * @param {object} options
 * @param {number} [options.minConfidence=0.70] Minimum acceptable confidence
 * @param {boolean} [options.allowStyle=false] Whether to permit cosmetic style issues
 * @returns {Array<object>} Vetted findings
 */
export function filterGroundedAiFindings(findings = [], options = {}) {
  const minConfidence = options.minConfidence ?? 0.70;
  const allowStyle = options.allowStyle ?? false;
  const STYLE_REGEX = /\b(prettier|formatting|indentation|naming convention|camelcase|pascalcase|spacing|whitespace|missing comment|add comment|jsdoc)\b/i;

  return findings.filter((finding) => {
    // 1. Minimum confidence threshold
    if (typeof finding.confidence === 'number' && finding.confidence < minConfidence) {
      return false;
    }

    // 2. Reject superficial cosmetic style complaints
    if (!allowStyle && finding.category === 'QUALITY' && finding.severity === 'LOW') {
      const text = `${finding.rule || ''} ${finding.title || ''} ${finding.description || ''}`;
      if (STYLE_REGEX.test(text)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Validates the full structured response returned by Gemini.
 *
 * @param {object} aiRawResponse Parsed JSON object from Gemini.
 * @param {string} code Raw source code analyzed.
 * @returns {{ valid: boolean, errors: string[], validatedData: object | null }}
 */
export function validateAiResponse(aiRawResponse, code = '') {
  const errors = [];

  if (!aiRawResponse || typeof aiRawResponse !== 'object' || Array.isArray(aiRawResponse)) {
    return {
      valid: false,
      errors: ['AI response must be a non-null object'],
      validatedData: null,
    };
  }

  // 1. Summary validation
  if (typeof aiRawResponse.summary !== 'string' || !aiRawResponse.summary.trim()) {
    errors.push('AI response must include a non-empty "summary" string');
  }

  // 2. Findings array validation
  if (!Array.isArray(aiRawResponse.findings)) {
    return {
      valid: false,
      errors: ['AI response "findings" must be an array', ...errors],
      validatedData: null,
    };
  }

  const totalLines = getSourceLineCount(code);
  const validatedFindings = [];

  aiRawResponse.findings.forEach((f, idx) => {
    const check = validateAiFinding(f, totalLines, code);
    if (!check.valid) {
      errors.push(`Finding [${idx}]: ${check.errors.join('; ')}`);
    } else {
      validatedFindings.push(check.sanitized);
    }
  });

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      validatedData: null,
    };
  }

  return {
    valid: true,
    errors: [],
    validatedData: {
      summary: aiRawResponse.summary.trim(),
      findings: validatedFindings,
      issues: validatedFindings, // Synonym for robust consumption across project services
    },
  };
}
