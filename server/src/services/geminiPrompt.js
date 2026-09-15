/**
 * Centralized Prompt Definitions and Schema for Google Gemini Code Review.
 */
import { formatNumberedSource } from '../utils/sourceContext.js';

export const GEMINI_SYSTEM_INSTRUCTION = `You are a senior software engineer and principal security auditor performing a semantic code review.

YOUR ROLE:
Identify meaningful semantic bugs, security vulnerabilities, edge cases, incorrect API/state usages, and performance concerns that CANNOT be confidently detected from static AST pattern matching alone.

CONSTRAINTS & RULES:
1. Grounding: Analyze ONLY the supplied source code. Do NOT assume unwritten files or missing dependencies exist.
2. Line Numbers: Line numbers MUST strictly refer to the 1-based numbered lines in the supplied source. Never invent line numbers.
3. Spans: Use the smallest relevant line span (line and endLine where endLine >= line).
4. No Duplication: Do NOT repeat or duplicate findings that the deterministic static analyzer already caught (listed under "Static Analysis Findings Already Detected").
5. Quality Over Quantity: Report at most 0 to 8 high-value, actionable findings. If the code is well-written, return an empty findings array.
6. Fixes: For the "fix" object, only provide "original" and "replacement" if the "original" string exists VERBATIM in the source code within the line range. Otherwise set both to null.
7. Confidence: Calibrate confidence between 0.0 and 1.0. Lower confidence for speculative concerns rather than fabricating certainty.`;

/**
 * Structured output JSON schema for Gemini response.
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: {
      type: 'STRING',
      description: 'Concise executive summary of semantic analysis observations and code quality.',
    },
    findings: {
      type: 'ARRAY',
      description: 'List of actionable semantic findings detected by Gemini (0 to 8 items).',
      items: {
        type: 'OBJECT',
        properties: {
          rule: {
            type: 'STRING',
            description: 'Short uppercase rule identifier (e.g. SEM-RACE-CONDITION, LOGIC-OFF-BY-ONE, API-MISUSE).',
          },
          severity: {
            type: 'STRING',
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
            description: 'Severity level of the semantic finding.',
          },
          category: {
            type: 'STRING',
            enum: ['SECURITY', 'QUALITY', 'PERFORMANCE', 'COMPLEXITY'],
            description: 'Category of the semantic finding.',
          },
          title: {
            type: 'STRING',
            description: 'Clear, concise title describing the semantic issue.',
          },
          line: {
            type: 'INTEGER',
            description: '1-based starting line number in the supplied numbered source.',
          },
          endLine: {
            type: 'INTEGER',
            description: '1-based ending line number in the supplied numbered source (endLine >= line).',
          },
          description: {
            type: 'STRING',
            description: 'Detailed explanation of why this code pattern is problematic.',
          },
          recommendation: {
            type: 'STRING',
            description: 'Concrete, actionable steps to fix or improve the code.',
          },
          confidence: {
            type: 'NUMBER',
            description: 'Confidence score between 0.0 and 1.0.',
          },
          evidence: {
            type: 'STRING',
            description: 'Verbatim code snippet from the target file demonstrating the defect.',
          },
          relatedFiles: {
            type: 'ARRAY',
            description: 'Optional list of related dependency file paths involved in this issue.',
            items: {
              type: 'STRING',
            },
          },
          fix: {
            type: 'OBJECT',
            description: 'Optional replacement code snippet. Must be verbatim text if provided.',
            properties: {
              original: {
                type: 'STRING',
                nullable: true,
                description: 'Verbatim code snippet to be replaced from source, or null.',
              },
              replacement: {
                type: 'STRING',
                nullable: true,
                description: 'Suggested replacement code, or null.',
              },
            },
            required: ['original', 'replacement'],
          },
        },
        required: [
          'rule',
          'severity',
          'category',
          'title',
          'line',
          'endLine',
          'description',
          'recommendation',
          'confidence',
          'fix',
        ],
      },
    },
  },
  required: ['summary', 'findings'],
};

/**
 * Builds the user prompt sent to Gemini, including context, static findings, and numbered code.
 *
 * @param {object} params
 * @param {string} params.code Raw source code.
 * @param {string} params.language Language identifier (e.g. 'javascript', 'jsx').
 * @param {string} params.filename Target filename.
 * @param {Array} params.staticIssues Pre-existing static findings.
 * @param {object} params.metrics Deterministic metrics (lines, complexity, etc.).
 * @returns {string} Prompt for Gemini.
 */
export function buildGeminiPrompt({
  code = '',
  language = 'javascript',
  filename = 'source.js',
  staticIssues = [],
  metrics = {},
}) {
  const numberedSource = formatNumberedSource(code);

  const staticSummary =
    staticIssues.length > 0
      ? staticIssues
          .map(
            (i) =>
              `- [${i.severity}] ${i.rule} at line ${i.line}: ${i.title} (${i.description})`
          )
          .join('\n')
      : 'None (no static defects flagged by deterministic engine).';

  return `FILE CONTEXT:
- Filename: ${filename}
- Language: ${language}
- Total Lines: ${metrics.lines ?? 'unknown'}
- Cyclomatic Complexity: ${metrics.complexity ?? 'unknown'}

STATIC ANALYSIS FINDINGS ALREADY DETECTED:
${staticSummary}

NOTE: Do NOT duplicate the findings listed above. Focus strictly on complementary semantic, logical, architectural, and edge-case concerns.

NUMBERED SOURCE CODE (1-BASED):
\`\`\`${language}
${numberedSource}
\`\`\`

Perform your review and return the structured JSON result adhering to the response schema.`;
}

/**
 * Builds a context-aware semantic review prompt incorporating cross-file dependencies,
 * graph topology, exported interfaces, and static issues.
 */
export function buildContextAwarePrompt({
  distilledContext,
  promptVersion = 'v2',
}) {
  if (!distilledContext || !distilledContext.targetFile) {
    return buildGeminiPrompt({});
  }

  const {
    targetFile,
    directDependencies = [],
    externalPackages = [],
    staticIssues = [],
    cycles = [],
  } = distilledContext;

  const numberedSource = formatNumberedSource(targetFile.content || '');

  const depSection = directDependencies.length > 0
    ? directDependencies
        .map((d) => {
          const exportStr = (d.exports && d.exports.length > 0) ? d.exports.join(', ') : 'none';
          const header = `--- Module: ${d.path} (role: ${d.role}, exported: [${exportStr}]) ---`;
          return `${header}\n\`\`\`javascript\n${d.content}\n\`\`\``;
        })
        .join('\n\n')
    : 'None (self-contained or zero local dependencies).';

  const staticSummary = staticIssues.length > 0
    ? staticIssues
        .map((i) => `- [${i.severity}] ${i.rule} at line ${i.line}: ${i.title} (${i.description})`)
        .join('\n')
    : 'None (no static defects flagged in this file).';

  const cyclesSummary = cycles.length > 0
    ? cycles.map((c) => `- Circular reference: ${c.join(' -> ')}`).join('\n')
    : 'None detected.';

  return `=== TARGET FILE TO REVIEW ===
File: ${targetFile.path}
Language: ${targetFile.language}
Total Lines: ${targetFile.lineCount}
Incoming Dependents (Fan-in): ${targetFile.fanIn}
Outgoing Dependencies (Fan-out): ${targetFile.fanOut}
Engine Version: 2.0 (Context-Aware Hybrid)
Prompt Version: ${promptVersion}

=== DIRECT LOCAL DEPENDENCIES (Bounded Context) ===
${depSection}

=== EXTERNAL PACKAGES USED ===
${externalPackages.length > 0 ? externalPackages.join(', ') : 'None'}

=== DEPENDENCY CYCLES ===
${cyclesSummary}

=== STATIC ANALYSIS FINDINGS ALREADY DETECTED (DO NOT DUPLICATE) ===
${staticSummary}

NOTE: The static analyzer has already reported the issues above. Do NOT duplicate or re-report them.
Focus on subtle cross-module contract mismatches, state mutations, logic defects, security bugs, and unhandled promise/error states.

=== TARGET FILE NUMBERED SOURCE CODE (1-BASED) ===
\`\`\`${targetFile.language}
${numberedSource}
\`\`\`

Return a structured JSON review complying strictly with the JSON schema.`;
}
