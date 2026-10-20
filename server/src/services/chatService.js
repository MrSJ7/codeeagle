/**
 * Review Chat Service ("Ask CodeEagle").
 * Reverse-engineered from CodeRabbit's interactive PR review assistant (@coderabbitai chat).
 * Handles inline finding queries, code explanation, testing guidance, and refactor requests.
 */
import { getGeminiClient, DEFAULT_GEMINI_MODEL } from './geminiService.js';

const TONE_PROMPTS = {
  quiet: 'You are CodeEagle in Quiet review mode. Be ultra-concise, high-signal, and focus strictly on blockers and security hazards. Keep answers direct and minimal.',
  chill: 'You are CodeEagle in Chill review mode. You are friendly, pragmatic, and constructive. Offer balanced advice, helpful code patterns, and practical trade-offs.',
  assertive: 'You are CodeEagle in Assertive review mode. You are a principal auditor enforcing rigorous security boundaries, strict types, zero tech debt, and comprehensive edge-case handling.',
  peer: 'You are a pragmatic, senior software engineer pair programming with a colleague. Speak concisely, practically, and respectfully.',
  mentor: 'You are an experienced mentor explaining concepts clearly with educational insights, best practices, and clean code examples.',
};

/**
 * Deterministic knowledge base for when Gemini is offline or unavailable.
 */
function getDeterministicChatAnswer({ rule = '', question = '', issue = null, code = '' }) {
  const q = question.toLowerCase();

  if (q.includes('test') || q.includes('jest') || q.includes('unit test')) {
    if (rule.includes('SECRET')) {
      return `To test for hardcoded credentials in CI/CD:
1. Use an automated secret scanner like \`gitleaks\` or CodeEagle's AST engine in pre-commit hooks.
2. In your unit tests, verify that \`process.env.JWT_SECRET\` is read dynamically:
\`\`\`javascript
test('throws if JWT_SECRET is unset in production', () => {
  delete process.env.JWT_SECRET;
  expect(() => generateToken(mockUser)).toThrow(/JWT_SECRET is required/);
});
\`\`\``;
    }
    if (rule.includes('REACT') || rule.includes('KEY') || rule.includes('HOOK')) {
      return `Here is a React Testing Library test for this scenario:
\`\`\`jsx
import { render, screen } from '@testing-library/react';
import ActivityFeed from './ActivityFeed';

test('renders items with unique, stable IDs without re-ordering keys', () => {
  const items = [{ id: 'a1', text: 'First' }, { id: 'b2', text: 'Second' }];
  render(<ActivityFeed items={items} />);
  expect(screen.getByText('First')).toBeInTheDocument();
});
\`\`\``;
    }
    return `To write a unit test for this logic:
\`\`\`javascript
describe('Logic test suite', () => {
  test('handles boundary and edge cases properly', () => {
    const result = evaluateCode({});
    expect(result).toBeDefined();
  });
});
\`\`\``;
  }

  if (q.includes('why') || q.includes('explain') || q.includes('root cause') || q.includes('how')) {
    if (rule === 'SEC-SECRET') {
      return `**Why this is dangerous:**
Hardcoded secrets (like strings in \`const JWT_SECRET = "..."\`) get committed to git history. Anyone with read access to the repository, clones, or build logs can extract this key and forge valid authentication tokens, completely bypassing your access controls.
**Remediation:** Move the credential to an environment variable loaded via \`process.env.JWT_SECRET\` or a secrets vault (AWS Secrets Manager, HashiCorp Vault).`;
    }
    if (rule === 'SEC-SQLI') {
      return `**Why this is dangerous:**
String concatenation or raw template literals in database queries allow attackers to inject malicious SQL syntax (e.g., \`' OR 1=1 --\`), potentially dumping entire tables or destroying data.
**Remediation:** Use parameterized queries or ORM query builders (e.g., \`db.query('SELECT * FROM users WHERE id = $1', [userId])\`).`;
    }
    if (rule === 'REACT-INDEX-KEY') {
      return `**Why array indices as React keys cause bugs:**
When list items are inserted, deleted, or sorted, React uses the \`key\` prop to preserve component state and avoid recreating DOM nodes. Using the loop index \`key={index}\` fools React into thinking item 0 is still item 0 even if the underlying item shifted, causing visual state corruption, input focus bugs, and animation glitches.
**Remediation:** Use a permanent, unique identifier from your data: \`key={item.id}\`.`;
    }
    if (rule === 'PERF-EFFECT-CLEANUP') {
      return `**Why missing cleanup is a problem:**
When adding event listeners in \`useEffect\` without returning an unbind function, every component re-render attaches a duplicate listener, causing memory leaks and event handler duplication.
**Remediation:** Always return a cleanup function:
\`\`\`javascript
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
\`\`\``;
    }
    if (issue?.description) {
      return `**CodeEagle Analysis:**
${issue.description}

**Actionable Recommendation:**
${issue.recommendation}`;
    }
  }

  if (q.includes('fix') || q.includes('refactor') || q.includes('solve')) {
    if (issue?.fix?.replacement) {
      return `Here is the verified fix:
\`\`\`javascript
${issue.fix.replacement}
\`\`\`
You can apply this in one click using the **Apply Fix & Re-Analyze** button.`;
    }
  }

  return `CodeEagle evaluated your query: "${question}".
Based on our static audit:
- Target File: \`${issue?.title || 'Active source buffer'}\`
- Severity: **${issue?.severity || 'NOTICE'}**
- Recommendation: ${issue?.recommendation || 'Ensure all inputs are validated, secrets kept in env vars, and complexity kept under control.'}`;
}

/**
 * Handles a conversation turn with CodeEagle.
 *
 * @param {object} params
 * @param {string} params.code Active source code.
 * @param {string} params.filename Target filename.
 * @param {object|null} params.issue Relevant finding if query is scoped to an issue.
 * @param {string} params.question User question or prompt.
 * @param {Array} [params.history] Previous message turns.
 * @param {string} [params.tone='peer'] Conversation tone ('peer' | 'mentor' | 'assertive').
 * @returns {Promise<{ reply: string, timestamp: string }>}
 */
export async function askCodeEagle({
  code = '',
  filename = 'source.js',
  issue = null,
  question = '',
  history = [],
  tone = 'peer',
}) {
  const timestamp = new Date().toISOString();

  if (!question || !question.trim()) {
    return {
      reply: 'Please provide a question or code topic to discuss with CodeEagle.',
      timestamp,
    };
  }

  const client = getGeminiClient();

  // If Gemini is not configured, gracefully use our deterministic knowledge engine
  if (!client) {
    const fallbackAnswer = getDeterministicChatAnswer({
      rule: issue?.rule || '',
      question,
      issue,
      code,
    });
    return {
      reply: fallbackAnswer,
      timestamp,
    };
  }

  try {
    const systemPrompt = `${TONE_PROMPTS[tone] || TONE_PROMPTS.peer}
You are CodeEagle AI, the autonomous code review intelligence (similar to CodeRabbit's conversational assistant).
Your goal is to assist the developer with precise, technically accurate, production-grade answers about the code review.

Context:
- Target File: "${filename}"
- Specific Finding Context: ${issue ? JSON.stringify({
    rule: issue.rule,
    severity: issue.severity,
    title: issue.title,
    line: issue.line,
    description: issue.description,
    recommendation: issue.recommendation,
  }) : 'General review of the file'}

Source Code Under Review:
\`\`\`
${code.slice(0, 15000)}
\`\`\`

Instructions:
1. Answer directly and concisely.
2. Provide code snippets with markdown formatting when relevant.
3. If recommending a fix, provide clean, idiomatic code without unnecessary comments.`;

    const chatHistory = (history || []).map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const response = await client.models.generateContent({
      model: modelName,
      contents: [
        ...chatHistory,
        {
          role: 'user',
          parts: [{ text: `Question: ${question}\n\nSystem Context: ${systemPrompt}` }],
        },
      ],
      config: {
        temperature: 0.2,
      },
    });

    const replyText = response?.text?.trim() || 'No answer generated.';
    return {
      reply: replyText,
      timestamp,
    };
  } catch (err) {
    console.error('[ChatService] Gemini chat call failed, falling back to deterministic answer:', err.message);
    const fallback = getDeterministicChatAnswer({
      rule: issue?.rule || '',
      question,
      issue,
      code,
    });
    return {
      reply: fallback,
      timestamp,
    };
  }
}
