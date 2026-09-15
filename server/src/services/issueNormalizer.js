/**
 * AI Finding Normalizer.
 * Maps Gemini semantic findings to a controlled AI rule namespace and canonical issue schema.
 */
import { generateIssueId } from '../utils/issueId.js';

export const CONTROLLED_AI_RULES = {
  'AI-LOGIC': { rule: 'AI-LOGIC', defaultCategory: 'QUALITY' },
  'AI-SECURITY': { rule: 'AI-SECURITY', defaultCategory: 'SECURITY' },
  'AI-PERFORMANCE': { rule: 'AI-PERFORMANCE', defaultCategory: 'PERFORMANCE' },
  'AI-REACT': { rule: 'AI-REACT', defaultCategory: 'QUALITY' },
  'AI-QUALITY': { rule: 'AI-QUALITY', defaultCategory: 'QUALITY' },
  'AI-COMPLEXITY': { rule: 'AI-COMPLEXITY', defaultCategory: 'COMPLEXITY' },
};

/**
 * Normalizes an arbitrary rule string from Gemini into the controlled AI namespace.
 *
 * @param {string} rawRule Raw rule string from model.
 * @param {string} category Canonical category.
 * @param {string} title Finding title.
 * @returns {string} One of the controlled AI rule names.
 */
export function normalizeAiRule(rawRule = '', category = 'QUALITY', title = '') {
  const upper = String(rawRule).toUpperCase().trim();

  // If already directly in the controlled namespace
  if (CONTROLLED_AI_RULES[upper]) {
    return upper;
  }

  const combined = `${upper} ${title}`.toLowerCase();

  if (combined.includes('react') || combined.includes('hook') || combined.includes('jsx') || combined.includes('render')) {
    return 'AI-REACT';
  }

  if (category === 'SECURITY' || combined.includes('sec') || combined.includes('auth') || combined.includes('inject') || combined.includes('token') || combined.includes('xss')) {
    return 'AI-SECURITY';
  }

  if (category === 'PERFORMANCE' || combined.includes('perf') || combined.includes('leak') || combined.includes('memory') || combined.includes('slow')) {
    return 'AI-PERFORMANCE';
  }

  if (category === 'COMPLEXITY' || combined.includes('complex') || combined.includes('nest')) {
    return 'AI-COMPLEXITY';
  }

  if (combined.includes('logic') || combined.includes('edge') || combined.includes('condition') || combined.includes('flow') || combined.includes('off-by-one')) {
    return 'AI-LOGIC';
  }

  return 'AI-QUALITY';
}

/**
 * Transforms validated Gemini findings into the canonical issue model with source: 'AI'.
 *
 * @param {Array} validatedFindings Array of validated AI findings from aiValidator.
 * @returns {Array} Canonical AI issues.
 */
export function normalizeAiFindings(validatedFindings = []) {
  if (!Array.isArray(validatedFindings)) return [];

  return validatedFindings.map((finding, index) => {
    const category = (finding.category || 'QUALITY').toUpperCase();
    const rule = normalizeAiRule(finding.rule, category, finding.title);
    const line = Math.max(1, Number.isInteger(finding.line) ? finding.line : 1);
    const endLine = Math.max(line, Number.isInteger(finding.endLine) ? finding.endLine : line);
    const confidence = Math.max(0, Math.min(1, typeof finding.confidence === 'number' ? finding.confidence : 0.8));

    const id = generateIssueId({
      source: 'AI',
      rule,
      line,
      endLine,
      title: finding.title,
      index,
    });

    let fix = null;
    if (finding.fix && typeof finding.fix === 'object' && finding.fix.original && finding.fix.replacement) {
      fix = {
        original: String(finding.fix.original),
        replacement: String(finding.fix.replacement),
      };
    }

    return {
      id,
      rule,
      source: 'AI',
      severity: (finding.severity || 'LOW').toUpperCase(),
      category,
      title: String(finding.title || 'Semantic Finding'),
      line,
      endLine,
      description: String(finding.description || ''),
      recommendation: String(finding.recommendation || ''),
      confidence,
      fix,
    };
  });
}
