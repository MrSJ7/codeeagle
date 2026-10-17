import { getGeminiClient, DEFAULT_GEMINI_MODEL } from './geminiService.js';
import { parseSource } from '../analyzers/parser.js';

/** Produce a reviewable candidate only when the model can provide a real edit. */
export async function generateFindingRefactor({ code = '', issue, filename = 'source.js' }) {
  if (typeof code !== 'string' || !issue || !Number.isInteger(issue.line)) {
    throw new Error('Invalid parameters for code refactor.');
  }

  const lines = code.split('\n');
  const startLine = issue.line;
  const endLine = Number.isInteger(issue.endLine) ? issue.endLine : startLine;
  if (startLine < 1 || endLine < startLine || endLine > lines.length) {
    throw new Error('Finding line range is outside the source file.');
  }
  const original = lines.slice(startLine - 1, endLine).join('\n');
  if (!original.trim() || code.indexOf(original) !== code.lastIndexOf(original)) {
    return { success: false, error: { message: 'This finding has no unique source span to edit safely.' } };
  }

  const client = getGeminiClient();
  if (!client) {
    return { success: false, error: { message: 'AI suggestions are unavailable. Configure GEMINI_API_KEY or follow the finding guidance manually.' } };
  }

  try {
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      contents: `Suggest a minimal code edit for ${filename}, lines ${startLine}-${endLine}.
Finding: ${issue.rule || 'UNKNOWN'} — ${issue.title || ''}
${issue.description || ''}
Recommendation: ${issue.recommendation || ''}

Full file for context:
\`\`\`javascript
${code}
\`\`\`

Replace only this exact span:
\`\`\`javascript
${original}
\`\`\`
Return JSON with replacement and a short explanation. Preserve the existing behavior outside the defect. If no sound fix can be inferred, return an empty replacement.`,
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });
    const candidate = JSON.parse(response?.text || '{}');
    const replacement = candidate?.replacement;
    if (typeof replacement !== 'string' || !replacement.trim() || replacement === original || replacement.length > 50000) {
      return { success: false, error: { message: 'No usable edit was generated for this finding.' } };
    }

    const patched = code.replace(original, replacement);
    const language = /\.(tsx|ts|jsx)$/.exec(filename)?.[1] || 'javascript';
    const { syntaxError } = parseSource(patched, language);
    if (syntaxError) {
      return { success: false, error: { message: `Suggested edit introduces a syntax error on line ${syntaxError.line}.` } };
    }

    return {
      success: true,
      original,
      replacement,
      explanation: String(candidate.explanation || 'Review the suggested edit and its effect on behavior before applying.'),
    };
  } catch (error) {
    console.warn('[RefactorService] Could not generate a candidate:', error.message);
    return { success: false, error: { message: 'AI could not generate a reliable edit. Use the finding guidance to fix it manually.' } };
  }
}
