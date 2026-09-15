/**
 * Hybrid Pipeline Integration & Orchestration Test Suite.
 * Fully mocks Gemini to test static-first fallback, AI merging, deduplication,
 * confidence-weighted scoring, and deterministic IDs.
 */
import { reviewCode } from '../src/services/reviewService.js';
import { setGeminiClientOverride } from '../src/services/geminiService.js';
import { validateReviewContract } from '../src/utils/contractValidator.js';
import { normalizeReviewData } from '../../client/src/utils/reviewHelpers.js';

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

async function runHybridTests() {
  console.log('=== Starting CodeLens Hybrid Pipeline Integration Tests ===\n');

  const cleanCode = `function multiply(a, b) {
  return a * b;
}`;

  const vulnerableCode = `const JWT_SECRET = "super_production_secret_key_889900";
function queryUser(userId) {
  const q = \`SELECT * FROM users WHERE id = \${userId}\`;
  return q;
}`;

  // -------------------------------------------------------------
  // Test 1 & 16 & 18: Static-only review when Gemini is unavailable (no API key)
  // -------------------------------------------------------------
  console.log('--- 1. Static-Only Baseline & Graceful Fallback ---');
  {
    setGeminiClientOverride(null);
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await reviewCode({ code: vulnerableCode, language: 'javascript', filename: 'auth.js' });
    assert(res.metadata.engine === 'static', 'Metadata engine is "static" when Gemini is unavailable (Test 1, 16)');
    assert(res.metadata.aiStatus === 'UNAVAILABLE', 'Metadata aiStatus is "UNAVAILABLE"');
    assert(res.score === 50, 'Static score 50 (2 critical issues: -25 each)');
    assert(res.issues.length === 2, 'Contains exactly 2 static issues');
    assert(res.issues.every((i) => i.source === 'STATIC'), 'All findings have source = "STATIC" (Test 6)');

    const contract = validateReviewContract(res);
    assert(contract.valid, `Static-only response satisfies review contract (errors: ${contract.errors.join(', ')})`);

    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  }

  // -------------------------------------------------------------
  // Test 2 & 5 & 17: Hybrid review when Gemini succeeds
  // -------------------------------------------------------------
  console.log('\n--- 2. Hybrid Review Merging & AI Source ---');
  {
    const mockAiClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Detected integer overflow potential in addition.',
            findings: [
              {
                rule: 'SEM-INT-OVERFLOW',
                severity: 'MEDIUM',
                category: 'QUALITY',
                title: 'Potential numeric overflow with large integers',
                line: 2,
                endLine: 2,
                description: 'Unchecked multiplication can overflow Number.MAX_SAFE_INTEGER.',
                recommendation: 'Use BigInt or check boundary thresholds.',
                confidence: 0.9,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockAiClient);

    const res = await reviewCode({ code: cleanCode, language: 'javascript', filename: 'math.js' });
    assert(res.metadata.engine === 'hybrid', 'Metadata engine is "hybrid" when Gemini succeeds (Test 2, 17)');
    assert(res.metadata.aiStatus === 'USED', 'Metadata aiStatus is "USED"');
    assert(res.issues.length === 1, 'Contains merged AI finding');
    assert(res.issues[0].source === 'AI', 'AI finding receives source = "AI" (Test 5)');
    assert(res.issues[0].rule === 'AI-QUALITY' || res.issues[0].rule === 'AI-LOGIC', 'AI rule mapped to controlled namespace');

    // Score deduction: Medium (-8), confidence 0.9 (multiplier 1.0) => 100 - 8 = 92
    assert(res.score === 92, `Score calculated after merge: 100 - 8 = 92 (got ${res.score}) (Test 12)`);
    assert(res.breakdown.quality === 92, `Quality breakdown is 92 (got ${res.breakdown.quality})`);

    const contract = validateReviewContract(res);
    assert(contract.valid, `Hybrid review response satisfies contract (errors: ${contract.errors.join(', ')})`);
  }

  // -------------------------------------------------------------
  // Test 3 & 4: Malformed AI output and invalid AI findings
  // -------------------------------------------------------------
  console.log('\n--- 3. Error Containment & Validation Guardrails ---');
  {
    // Malformed JSON output
    const mockMalformedClient = {
      models: {
        generateContent: async () => ({
          text: 'This is not valid JSON output!',
        }),
      },
    };

    setGeminiClientOverride(mockMalformedClient);
    const resMalformed = await reviewCode({ code: cleanCode, language: 'javascript' });
    assert(resMalformed.metadata.engine === 'static', 'Malformed AI output gracefully falls back to static review (Test 3)');
    assert(resMalformed.metadata.aiStatus === 'VALIDATION_FAILED', 'aiStatus is "VALIDATION_FAILED"');
    assert(resMalformed.score === 100, 'Score remains unaffected by malformed AI');

    // Invalid line number from AI
    const mockInvalidLineClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Invalid line finding',
            findings: [
              {
                rule: 'AI-LOGIC',
                severity: 'HIGH',
                category: 'QUALITY',
                title: 'Hallucinated line',
                line: 500, // cleanCode only has 3 lines
                endLine: 500,
                description: 'Out of range',
                recommendation: 'Fix',
                confidence: 0.9,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockInvalidLineClient);
    const resInvalidLine = await reviewCode({ code: cleanCode, language: 'javascript' });
    assert(resInvalidLine.metadata.engine === 'static', 'Invalid AI finding rejected by guardrails (Test 4)');
    assert(resInvalidLine.metadata.aiStatus === 'VALIDATION_FAILED', 'aiStatus marked as "VALIDATION_FAILED"');
  }

  // -------------------------------------------------------------
  // Test 7 & 8: Deterministic AI Issue IDs
  // -------------------------------------------------------------
  console.log('\n--- 4. Deterministic Issue IDs ---');
  {
    const mockAiClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Deterministic finding',
            findings: [
              {
                rule: 'AI-LOGIC',
                severity: 'LOW',
                category: 'QUALITY',
                title: 'Check parameters',
                line: 1,
                endLine: 1,
                description: 'Verify inputs',
                recommendation: 'Add type check',
                confidence: 0.7,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockAiClient);

    const run1 = await reviewCode({ code: cleanCode });
    const run2 = await reviewCode({ code: cleanCode });

    assert(run1.issues[0].id === run2.issues[0].id, `Same input produces identical AI issue ID: ${run1.issues[0].id} (Test 7)`);
    assert(run1.issues[0].id.startsWith('AI-'), 'AI issue ID starts with AI rule prefix');
    assert(!run1.issues[0].id.includes('undefined') && !run1.issues[0].id.includes('null'), 'Issue ID is clean (Test 8)');
  }

  // -------------------------------------------------------------
  // Test 9 & 10: Deduplication - Static Finding Wins
  // -------------------------------------------------------------
  console.log('\n--- 5. Issue Deduplication ---');
  {
    // AI returns a finding on line 1 for hardcoded secret, which static analysis already found!
    const mockDuplicateAiClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Found secret token',
            findings: [
              {
                rule: 'AI-SECURITY',
                severity: 'CRITICAL',
                category: 'SECURITY',
                title: 'Hardcoded secret token in JWT_SECRET',
                line: 1,
                endLine: 1,
                description: 'The variable JWT_SECRET contains an exposed credential literal.',
                recommendation: 'Load from environment variable.',
                confidence: 0.95,
                fix: null,
              },
              {
                rule: 'AI-LOGIC',
                severity: 'LOW',
                category: 'QUALITY',
                title: 'Missing return type annotation',
                line: 2,
                endLine: 2,
                description: 'Function queryUser lacks JSDoc documentation.',
                recommendation: 'Add JSDoc comment.',
                confidence: 0.75,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockDuplicateAiClient);

    const res = await reviewCode({ code: vulnerableCode, language: 'javascript', filename: 'auth.js' });

    // Should have 2 static issues + 1 non-duplicate AI issue = 3 issues total
    // The duplicate AI-SECURITY on line 1 MUST be discarded!
    assert(res.issues.length === 3, `Deduplication removed duplicate AI finding (expected 3 issues, got ${res.issues.length}) (Test 9)`);

    const line1Issues = res.issues.filter((i) => i.line === 1);
    assert(line1Issues.length === 1, 'Only 1 finding remains on line 1');
    assert(line1Issues[0].source === 'STATIC', 'Static finding won over duplicate AI finding (Test 10)');
    assert(line1Issues[0].rule === 'SEC-SECRET', 'Retained finding is the canonical static SEC-SECRET');

    // The genuine AI issue on line 2 was preserved
    const aiIssue = res.issues.find((i) => i.source === 'AI');
    assert(aiIssue !== undefined && aiIssue.line === 2, 'Unique non-duplicate AI finding was preserved');
  }

  // -------------------------------------------------------------
  // Test 11: Summary equals final merged issue counts
  // -------------------------------------------------------------
  console.log('\n--- 6. Summary Counts strictly derived from Final Issues ---');
  {
    const mockAiClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'AI findings',
            findings: [
              {
                rule: 'AI-PERFORMANCE',
                severity: 'HIGH',
                category: 'PERFORMANCE',
                title: 'Expensive loop',
                line: 2,
                endLine: 2,
                description: 'Slow computation',
                recommendation: 'Optimize',
                confidence: 0.85,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockAiClient);
    const res = await reviewCode({ code: cleanCode });

    assert(res.summary.totalIssues === res.issues.length, 'summary.totalIssues matches issues.length (Test 11)');
    assert(res.summary.high === 1, 'summary.high matches 1 high issue');
    assert(res.summary.critical === 0, 'summary.critical is 0');
  }

  // -------------------------------------------------------------
  // Test 13 & 14 & 15: AI Confidence Multipliers & Score Clamping
  // -------------------------------------------------------------
  console.log('\n--- 7. Confidence-Weighted Penalties & Clamping ---');
  {
    // Confidence < 0.60 => multiplier 0.50. HIGH (-15) * 0.50 = -8
    const mockLowConfClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Speculative issue',
            findings: [
              {
                rule: 'AI-LOGIC',
                severity: 'HIGH',
                category: 'QUALITY',
                title: 'Speculative edge case',
                line: 2,
                endLine: 2,
                description: 'Low confidence observation',
                recommendation: 'Verify manually',
                confidence: 0.5, // < 0.60
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockLowConfClient);
    const resLowConf = await reviewCode({ code: cleanCode });
    // Base 100 - round(15 * 0.5) = 100 - 8 = 92
    assert(resLowConf.score === 92, `Low confidence (<0.60) applies 50% penalty: 100 - 8 = 92 (got ${resLowConf.score}) (Test 13)`);

    // Confidence 0.60 - 0.79 => multiplier 0.75. HIGH (-15) * 0.75 = -11
    const mockMidConfClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Mid confidence issue',
            findings: [
              {
                rule: 'AI-LOGIC',
                severity: 'HIGH',
                category: 'QUALITY',
                title: 'Medium confidence issue',
                line: 2,
                endLine: 2,
                description: 'Medium confidence observation',
                recommendation: 'Verify',
                confidence: 0.7, // 0.60-0.79
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockMidConfClient);
    const resMidConf = await reviewCode({ code: cleanCode });
    // Base 100 - round(15 * 0.75) = 100 - 11 = 89
    assert(resMidConf.score === 89, `Mid confidence (0.70) applies 75% penalty: 100 - 11 = 89 (got ${resMidConf.score})`);

    // Score never goes below 0 (Test 14)
    const mockHugePenaltiesClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Multiple critical issues',
            findings: Array.from({ length: 6 }, (_, i) => ({
              rule: 'AI-SECURITY',
              severity: 'CRITICAL',
              category: 'SECURITY',
              title: `Critical issue ${i + 1}`,
              line: 1,
              endLine: 1,
              description: 'Vulnerability',
              recommendation: 'Fix',
              confidence: 1.0,
              fix: null,
            })),
          }),
        }),
      },
    };

    setGeminiClientOverride(mockHugePenaltiesClient);
    const resClamped = await reviewCode({ code: cleanCode });
    assert(resClamped.score >= 0, `Score is clamped and never negative: ${resClamped.score} (Test 14)`);
    assert(resClamped.breakdown.security >= 0, `Category score is clamped: ${resClamped.breakdown.security} (Test 15)`);
  }

  // -------------------------------------------------------------
  // Test 19: Frontend Normalizer Preserves Hybrid Fields
  // -------------------------------------------------------------
  console.log('\n--- 8. Frontend Normalization Integration ---');
  {
    const hybridPayload = {
      score: 85,
      breakdown: { security: 100, quality: 85, performance: 100, complexity: 100 },
      metrics: { lines: 10, functions: 1, branches: 1, complexity: 2, maxNesting: 1 },
      issues: [
        {
          id: 'AI-LOGIC-2-a1b2',
          rule: 'AI-LOGIC',
          source: 'AI',
          severity: 'HIGH',
          category: 'QUALITY',
          title: 'Semantic issue',
          line: 2,
          endLine: 2,
          description: 'Desc',
          recommendation: 'Rec',
          confidence: 0.85,
          fix: null,
        },
      ],
      summary: { totalIssues: 1, critical: 0, high: 1, medium: 0, low: 0 },
      metadata: {
        engine: 'hybrid',
        aiStatus: 'USED',
        language: 'javascript',
        filename: 'calc.js',
        codeHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
    };

    const normalized = normalizeReviewData(hybridPayload);
    assert(normalized.metadata.engine === 'hybrid', 'Frontend preserves metadata.engine = "hybrid" (Test 19)');
    assert(normalized.metadata.aiStatus === 'USED', 'Frontend preserves metadata.aiStatus = "USED"');
    assert(normalized.issues[0].source === 'AI', 'Frontend preserves issue source = "AI"');
    assert(normalized.issues[0].id === 'AI-LOGIC-2-a1b2', 'Frontend preserves AI issue id');
  }

  // -------------------------------------------------------------
  // Test 20: Determinism in Hybrid Mode
  // -------------------------------------------------------------
  console.log('\n--- 9. Hybrid Mode Determinism ---');
  {
    const mockFixedClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Consistent semantic review',
            findings: [
              {
                rule: 'AI-LOGIC',
                severity: 'MEDIUM',
                category: 'QUALITY',
                title: 'Constant return in helper',
                line: 2,
                endLine: 2,
                description: 'Function may return constant value.',
                recommendation: 'Verify logic.',
                confidence: 0.8,
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockFixedClient);

    const runA = JSON.stringify(await reviewCode({ code: cleanCode, language: 'javascript', filename: 'test.js' }));
    let allIdentical = true;

    for (let i = 0; i < 4; i++) {
      const runB = JSON.stringify(await reviewCode({ code: cleanCode, language: 'javascript', filename: 'test.js' }));
      if (runA !== runB) {
        allIdentical = false;
        break;
      }
    }

    assert(allIdentical, 'Repeated hybrid reviews with identical model response are 100% byte-for-byte identical (Determinism confirmed)');
  }

  // Reset override
  setGeminiClientOverride(null);

  console.log(`\n=== Final Hybrid Pipeline Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runHybridTests();
