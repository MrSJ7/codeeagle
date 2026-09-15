/**
 * Google Gemini Integration, Validation, and Guardrail Test Suite.
 * Fully mocks the Gemini GenAI SDK to guarantee zero network or API-key dependency.
 */
import { formatNumberedSource, getSourceLineCount } from '../src/utils/sourceContext.js';
import { buildGeminiPrompt } from '../src/services/geminiPrompt.js';
import { validateAiFinding, validateAiResponse } from '../src/services/aiValidator.js';
import {
  analyzeCodeWithGemini,
  setGeminiClientOverride,
} from '../src/services/geminiService.js';
import { analyzeCode } from '../src/analyzers/analyzeCode.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runGeminiTests() {
  console.log('=== Starting CodeLens Gemini Service & AI Guardrail Tests ===\n');

  const sampleSource = `function calculateTotal(price, taxRate) {
  if (price < 0) return 0;
  const tax = price * taxRate;
  return price + tax;
}`;
  const totalLines = getSourceLineCount(sampleSource);

  // -------------------------------------------------------------
  // 1. Source Context & Prompt Generation Tests
  // -------------------------------------------------------------
  console.log('--- 1. Source Context & Prompt Grounding ---');
  {
    const numbered = formatNumberedSource(sampleSource);
    assert(numbered.startsWith('1 | function calculateTotal'), 'Numbered source starts with line 1');
    assert(numbered.includes('3 |   const tax = price * taxRate;'), 'Numbered source contains line 3 with verbatim text');
    assert(totalLines === 5, `Source line count calculated correctly (got ${totalLines})`);

    const prompt = buildGeminiPrompt({
      code: sampleSource,
      language: 'javascript',
      filename: 'tax.js',
      staticIssues: [{ rule: 'QUAL-VAR', line: 3, severity: 'LOW', title: 'var usage', description: 'legacy var' }],
      metrics: { lines: 5, complexity: 2 },
    });
    assert(prompt.includes('tax.js'), 'Prompt includes filename');
    assert(prompt.includes('QUAL-VAR'), 'Prompt includes existing static issues to avoid duplicate reporting');
    assert(prompt.includes('1 | function calculateTotal'), 'Prompt embeds numbered source code');
  }

  // -------------------------------------------------------------
  // 2. AI Finding Validator & Guardrails Tests
  // -------------------------------------------------------------
  console.log('\n--- 2. AI Validator & Guardrail Rules ---');

  // 2.1 Valid AI finding
  {
    const validRaw = {
      rule: 'SEM-FLOAT-PRECISION',
      severity: 'MEDIUM',
      category: 'QUALITY',
      title: 'Floating point rounding error',
      line: 3,
      endLine: 3,
      description: 'Direct multiplication of price and taxRate may produce floating-point precision inaccuracies.',
      recommendation: 'Use integer cents or a financial rounding library.',
      confidence: 0.9,
      fix: {
        original: 'const tax = price * taxRate;',
        replacement: 'const tax = Math.round(price * taxRate * 100) / 100;',
      },
    };

    const res = validateAiFinding(validRaw, totalLines, sampleSource);
    assert(res.valid, 'Valid semantic finding passes validation');
    assert(res.sanitized.rule === 'SEM-FLOAT-PRECISION', 'Rule is normalized to uppercase');
    assert(res.sanitized.fix !== null, 'Verbatim fix is preserved');
  }

  // 2.2 Invalid severity rejected (Test #4)
  {
    const raw = {
      rule: 'TEST',
      severity: 'EXTREME',
      category: 'SECURITY',
      title: 'Invalid severity',
      line: 1,
      endLine: 1,
      description: 'Desc',
      recommendation: 'Rec',
      confidence: 0.8,
      fix: null,
    };
    const res = validateAiFinding(raw, totalLines, sampleSource);
    assert(!res.valid, 'Invalid severity "EXTREME" rejected');
    assert(res.errors.some((e) => e.includes('severity')), 'Reports severity validation error');
  }

  // 2.3 Invalid category rejected (Test #5)
  {
    const raw = {
      rule: 'TEST',
      severity: 'HIGH',
      category: 'SYNTAX_ERROR',
      title: 'Invalid category',
      line: 1,
      endLine: 1,
      description: 'Desc',
      recommendation: 'Rec',
      confidence: 0.8,
      fix: null,
    };
    const res = validateAiFinding(raw, totalLines, sampleSource);
    assert(!res.valid, 'Invalid category "SYNTAX_ERROR" rejected');
    assert(res.errors.some((e) => e.includes('category')), 'Reports category validation error');
  }

  // 2.4 Invalid confidence rejected (Test #6)
  {
    const rawTooHigh = {
      rule: 'TEST',
      severity: 'LOW',
      category: 'QUALITY',
      title: 'Title',
      line: 1,
      endLine: 1,
      description: 'Desc',
      recommendation: 'Rec',
      confidence: 1.5, // > 1
      fix: null,
    };
    const resTooHigh = validateAiFinding(rawTooHigh, totalLines, sampleSource);
    assert(!resTooHigh.valid, 'Confidence > 1.0 rejected');

    const rawNegative = { ...rawTooHigh, confidence: -0.2 };
    const resNegative = validateAiFinding(rawNegative, totalLines, sampleSource);
    assert(!resNegative.valid, 'Negative confidence rejected');
  }

  // 2.5 line = 0 rejected (Test #7)
  {
    const raw = {
      rule: 'TEST',
      severity: 'MEDIUM',
      category: 'QUALITY',
      title: 'Title',
      line: 0,
      endLine: 1,
      description: 'Desc',
      recommendation: 'Rec',
      confidence: 0.9,
      fix: null,
    };
    const res = validateAiFinding(raw, totalLines, sampleSource);
    assert(!res.valid, 'line = 0 rejected (must be 1-based integer)');
    assert(res.errors.some((e) => e.includes('1-based')), 'Error specifically mentions 1-based requirement');
  }

  // 2.6 endLine < line rejected (Test #8)
  {
    const raw = {
      rule: 'TEST',
      severity: 'MEDIUM',
      category: 'QUALITY',
      title: 'Title',
      line: 4,
      endLine: 2,
      description: 'Desc',
      recommendation: 'Rec',
      confidence: 0.9,
      fix: null,
    };
    const res = validateAiFinding(raw, totalLines, sampleSource);
    assert(!res.valid, 'endLine < line rejected (span inverted)');
    assert(res.errors.some((e) => e.includes('cannot be less than "line"')), 'Error specifies endLine < line constraint');
  }

  // 2.7 line beyond source length rejected (Test #9)
  {
    const raw = {
      rule: 'TEST',
      severity: 'MEDIUM',
      category: 'QUALITY',
      title: 'Title',
      line: 99, // Source only has 5 lines
      endLine: 99,
      description: 'Desc',
      recommendation: 'Rec',
      confidence: 0.9,
      fix: null,
    };
    const res = validateAiFinding(raw, totalLines, sampleSource);
    assert(!res.valid, 'Line number 99 beyond source length (5) rejected');
    assert(res.errors.some((e) => e.includes('exceeds total source lines')), 'Error specifies source boundary check');
  }

  // 2.8 Invalid fix snippet becomes null without rejecting the finding (Test #11)
  {
    const rawWithBogusFix = {
      rule: 'SEM-LOGIC',
      severity: 'HIGH',
      category: 'QUALITY',
      title: 'Valid finding with hallucinated fix',
      line: 2,
      endLine: 2,
      description: 'Logic issue description',
      recommendation: 'Logic recommendation',
      confidence: 0.85,
      fix: {
        original: 'const completely_made_up_code = 999;',
        replacement: 'const safe = 0;',
      },
    };
    const res = validateAiFinding(rawWithBogusFix, totalLines, sampleSource);
    assert(res.valid, 'Finding remains valid even when fix is hallucinated');
    assert(res.sanitized.fix === null, 'Hallucinated fix snippet is sanitized to null');
  }

  // -------------------------------------------------------------
  // 3. Gemini Service & Lifecycle Tests
  // -------------------------------------------------------------
  console.log('\n--- 3. Gemini Service Mock & Failure Behavior ---');

  // 3.1 Missing GEMINI_API_KEY handled safely (Test #1)
  {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    setGeminiClientOverride(null);

    const result = await analyzeCodeWithGemini({
      code: sampleSource,
      language: 'javascript',
      filename: 'tax.js',
    });

    assert(result.status === 'UNAVAILABLE', 'Missing GEMINI_API_KEY returns status "UNAVAILABLE"');
    assert(result.data === null, 'Data is null when service is unavailable');
    assert(typeof result.error === 'string' && result.error.includes('GEMINI_API_KEY'), 'Clear error message returned');

    // Restore key if there was one
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  }

  // 3.2 Mocked successful Gemini response & structured JSON parsing (Test #2 & #3)
  {
    const mockClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'The code is clean with one potential edge case in negative price handling.',
            findings: [
              {
                rule: 'SEM-EDGE-CASE',
                severity: 'MEDIUM',
                category: 'QUALITY',
                title: 'Potential negative price ambiguity',
                line: 2,
                endLine: 2,
                description: 'Returning 0 on negative price may hide upstream validation errors.',
                recommendation: 'Throw an IllegalArgumentException or return a Result type.',
                confidence: 0.8,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockClient);

    const result = await analyzeCodeWithGemini({
      code: sampleSource,
      language: 'javascript',
      filename: 'tax.js',
    });

    assert(result.status === 'SUCCESS', 'Mocked successful Gemini response returns status "SUCCESS"');
    assert(result.data !== null, 'Data object is populated');
    assert(result.data.findings.length === 1, 'Contains 1 validated semantic finding');
    assert(result.data.findings[0].rule === 'SEM-EDGE-CASE', 'Finding rule parsed accurately');
    assert(result.data.findings[0].line === 2, 'Finding line parsed as integer 2');
    assert(result.error === null, 'Error is null on success');
  }

  // 3.3 Malformed model response rejected (Test #10)
  {
    const mockMalformedClient = {
      models: {
        generateContent: async () => ({
          text: 'Here is your code review:\nEverything looks great! No issues found.', // Not JSON
        }),
      },
    };

    setGeminiClientOverride(mockMalformedClient);

    const result = await analyzeCodeWithGemini({
      code: sampleSource,
      language: 'javascript',
      filename: 'tax.js',
    });

    assert(result.status === 'VALIDATION_FAILED', 'Non-JSON text response returns status "VALIDATION_FAILED"');
    assert(result.data === null, 'Data is null on parse failure');
    assert(result.error.includes('JSON'), 'Error identifies JSON parsing failure');
  }

  // 3.4 Schema violation in response rejected
  {
    const mockInvalidSchemaClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Code review',
            findings: [
              {
                rule: 'SEM-BUG',
                severity: 'LOW',
                category: 'QUALITY',
                title: 'Finding title',
                line: 9999, // Impossible line
                endLine: 9999,
                description: 'Description',
                recommendation: 'Recommendation',
                confidence: 0.8,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockInvalidSchemaClient);

    const result = await analyzeCodeWithGemini({
      code: sampleSource,
      language: 'javascript',
      filename: 'tax.js',
    });

    assert(result.status === 'VALIDATION_FAILED', 'Schema validation failure returns status "VALIDATION_FAILED"');
    assert(result.error.includes('exceeds total source lines'), 'Identifies invalid line number');
  }

  // 3.5 Network or provider error handled gracefully
  {
    const mockFailingClient = {
      models: {
        generateContent: async () => {
          throw new Error('503 Service Unavailable: High load on provider');
        },
      },
    };

    setGeminiClientOverride(mockFailingClient);

    const result = await analyzeCodeWithGemini({
      code: sampleSource,
      language: 'javascript',
      filename: 'tax.js',
    });

    assert(result.status === 'UNAVAILABLE', 'Provider error returns status "UNAVAILABLE" without throwing');
    assert(result.data === null, 'Data is null on network error');
  }

  // 3.6 Deterministic static analyzer remains 100% usable when Gemini fails (Test #12)
  {
    // Clean reset
    setGeminiClientOverride(null);

    const staticResult = analyzeCode(sampleSource, 'javascript', 'tax.js');
    assert(staticResult.score === 100, 'Static analyzer still scores clean function as 100');
    assert(staticResult.metrics.lines === 5, 'Static analyzer computes metrics independently');
    assert(staticResult.metrics.complexity === 2, 'Static analyzer calculates complexity independently');
    assert(Array.isArray(staticResult.issues), 'Static issues array remains intact');
  }

  // Clean up mock override
  setGeminiClientOverride(null);

  console.log(`\n=== Gemini Test Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runGeminiTests();
