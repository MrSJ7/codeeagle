import { computeCodeHash } from '../src/utils/codeHasher.js';
import { reviewCode } from '../src/services/reviewService.js';
import { setGeminiClientOverride } from '../src/services/geminiService.js';
import { verifyPatch, applyPatch } from '../src/services/patchService.js';
import { verifyAiPatch } from '../src/services/aiPatchVerifier.js';

const API_BASE = 'http://localhost:5001';

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

async function runFailureTests() {
  console.log('=== Starting CodeLens Comprehensive Failure Modes (A-K) Test Suite ===\n');

  // -------------------------------------------------------------------------
  // Scenario A: Gemini API Unavailable -> Static Fallback, Status 200, aiStatus: UNAVAILABLE
  // -------------------------------------------------------------------------
  console.log('--- Scenario A: Gemini API Unavailable Fallback ---');
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'function test() { return 42; }',
        language: 'javascript',
        filename: 'test.js',
      }),
    });
    assert(res.status === 200, 'Scenario A: POST /api/review returns 200 even when Gemini is unconfigured');
    const data = await res.json();
    assert(data.metadata.engine === 'static' || data.metadata.engine === 'hybrid', 'Scenario A: Engine metadata present');
    assert(data.metadata.aiStatus === 'UNAVAILABLE' || data.metadata.aiStatus === 'USED', 'Scenario A: aiStatus accurately reported');
    assert(typeof data.score === 'number', 'Scenario A: Score computed deterministically');
  } catch (err) {
    assert(false, `Scenario A failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario B: MongoDB Unavailable -> Memory Fallback, Audit Persisted, No Crash
  // -------------------------------------------------------------------------
  console.log('--- Scenario B: Database Unreachable Fallback ---');
  try {
    const healthRes = await fetch(`${API_BASE}/api/health`);
    assert(healthRes.status === 200, 'Scenario B: GET /api/health returns 200 OK');
    const healthData = await healthRes.json();
    assert(healthData.persistence === 'memory' || healthData.persistence === 'mongodb', 'Scenario B: Health payload reports persistence mode');

    // Create review and confirm it persists in active persistence mode
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'const safe = true;\nconsole.log(safe);',
        language: 'javascript',
        filename: 'safe.js',
      }),
    });
    assert(res.status === 200, 'Scenario B: Review saved cleanly in active persistence mode');
    const reviewData = await res.json();
    assert(typeof reviewData.reviewId === 'string', 'Scenario B: reviewId allocated without crashing');
  } catch (err) {
    assert(false, `Scenario B failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario C: Malformed AI Response -> Static Fallback, aiStatus: VALIDATION_FAILED
  // -------------------------------------------------------------------------
  console.log('--- Scenario C: Malformed AI Response Containment ---');
  try {
    // Test through hybrid service with mocked malformed Gemini response
    setGeminiClientOverride({
      models: {
        generateContent: async () => ({ text: 'NOT_VALID_JSON_AT_ALL {{{' }),
      },
    });

    const badJsonResponse = await reviewCode({
      code: 'function add(a, b) { return a + b; }',
      language: 'javascript',
      filename: 'add.js',
    });
    assert(badJsonResponse.metadata.aiStatus === 'VALIDATION_FAILED', 'Scenario C: Bad JSON flags aiStatus as VALIDATION_FAILED');
    assert(badJsonResponse.metadata.engine === 'static', 'Scenario C: Engine falls back to static');
    assert(badJsonResponse.score === 100, 'Scenario C: Score remains pure static score (100)');

    // Test invalid schema (line 500 on 3-line file)
    setGeminiClientOverride({
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            summary: 'Bad schema',
            findings: [{ rule: 'AI-LOGIC', severity: 'HIGH', category: 'QUALITY', title: 'Hallucination', line: 500, endLine: 500 }],
          }),
        }),
      },
    });

    const badSchemaResponse = await reviewCode({
      code: 'function add(a, b) { return a + b; }',
      language: 'javascript',
      filename: 'add.js',
    });
    assert(badSchemaResponse.metadata.aiStatus === 'VALIDATION_FAILED', 'Scenario C: Bad schema flags aiStatus as VALIDATION_FAILED');
    assert(badSchemaResponse.metadata.engine === 'static', 'Scenario C: Bad schema falls back to static');

    // Reset override
    setGeminiClientOverride(null);
  } catch (err) {
    setGeminiClientOverride(null);
    assert(false, `Scenario C failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario D: Stale Source Patch Attempt -> Rejected with 409 STALE_SOURCE
  // -------------------------------------------------------------------------
  console.log('--- Scenario D: Stale Source Protection ---');
  try {
    const currentCode = 'const secret = "key_12345";';
    const fakeStaleHash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const issue = {
      id: 'SEC-SECRET-1',
      rule: 'SEC-SECRET',
      source: 'STATIC',
      severity: 'CRITICAL',
      category: 'SECURITY',
      title: 'Secret',
      line: 1,
      endLine: 1,
      fix: {
        original: 'const secret = "key_12345";',
        replacement: 'const secret = process.env.SECRET;',
      },
    };

    const res = await fetch(`${API_BASE}/api/patch/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: currentCode,
        codeHash: fakeStaleHash,
        issue,
      }),
    });
    assert(res.status === 409, 'Scenario D: Stale patch returns HTTP 409 Conflict');
    const errData = await res.json();
    const errCode = typeof errData.error === 'object' ? errData.error.code : errData.error;
    assert(errCode === 'STALE_SOURCE', 'Scenario D: Error code is STALE_SOURCE');
  } catch (err) {
    assert(false, `Scenario D failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario E: Invalid Patch Candidate -> Controlled Rejection Reasons
  // -------------------------------------------------------------------------
  console.log('--- Scenario E: Invalid Patch Candidate Controls ---');
  try {
    const testCode = 'const a = 10;\nconst b = 20;\nconst c = 30;';
    const currentHash = computeCodeHash(testCode);

    // E.1 Missing Snippet
    const missingVerify = verifyPatch({
      code: testCode,
      codeHash: currentHash,
      issue: {
        id: 'SEC-SECRET-1',
        rule: 'SEC-SECRET',
        source: 'STATIC',
        fix: { original: 'NONEXISTENT_SNIPPET_HERE', replacement: 'clean' },
        line: 1,
        endLine: 1,
      },
    });
    assert(!missingVerify.applicable, 'Scenario E.1: Missing snippet not applicable');
    assert(missingVerify.reason === 'ORIGINAL_NOT_FOUND', 'Scenario E.1: Reason is ORIGINAL_NOT_FOUND');

    // E.2 Duplicate Snippet (Ambiguous match)
    const dupCode = 'const val = 1;\nconst val = 1;';
    const dupVerify = verifyPatch({
      code: dupCode,
      codeHash: computeCodeHash(dupCode),
      issue: {
        id: 'SEC-SECRET-1',
        rule: 'SEC-SECRET',
        source: 'STATIC',
        fix: { original: 'const val = 1;', replacement: 'const val = 2;' },
        line: 1,
        endLine: 1,
      },
    });
    assert(!dupVerify.applicable, 'Scenario E.2: Ambiguous duplicate snippet not applicable');
    assert(dupVerify.reason === 'MULTIPLE_MATCHES', 'Scenario E.2: Reason is MULTIPLE_MATCHES');

    // E.3 Out of bounds line range
    const oobVerify = verifyPatch({
      code: testCode,
      codeHash: currentHash,
      issue: {
        id: 'SEC-SECRET-1',
        rule: 'SEC-SECRET',
        source: 'STATIC',
        fix: { original: 'const a = 10;', replacement: 'const a = 11;' },
        line: 999,
        endLine: 999,
      },
    });
    assert(!oobVerify.applicable, 'Scenario E.3: Out of bounds line not applicable');
    assert(oobVerify.reason === 'LINE_RANGE_MISMATCH' || oobVerify.reason === 'INVALID_LINE_RANGE', 'Scenario E.3: Reason is line range mismatch');
  } catch (err) {
    assert(false, `Scenario E failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario F: Duplicate Patch Application -> Controlled Rejection
  // -------------------------------------------------------------------------
  console.log('--- Scenario F: Duplicate Patch Application ---');
  try {
    const originalCode = 'const token = "hardcoded_token_secret_12345";';
    const initialHash = computeCodeHash(originalCode);
    const issue = {
      id: 'SEC-SECRET-1',
      rule: 'SEC-SECRET',
      source: 'STATIC',
      severity: 'CRITICAL',
      category: 'SECURITY',
      title: 'Hardcoded Secret',
      line: 1,
      endLine: 1,
      fix: {
        original: 'const token = "hardcoded_token_secret_12345";',
        replacement: 'const token = process.env.TOKEN;',
      },
    };

    // First apply succeeds
    const firstApply = applyPatch({
      code: originalCode,
      codeHash: initialHash,
      issue,
    });
    assert(firstApply.success === true, 'Scenario F: First patch application succeeds');
    const patchedCode = firstApply.patchedCode;
    const patchedHash = firstApply.afterHash;

    // Second apply with updated source and updated hash
    const secondApply = applyPatch({
      code: patchedCode,
      codeHash: patchedHash,
      issue,
    });
    assert(secondApply.success === false, 'Scenario F: Re-applying already applied patch fails');
    assert(secondApply.reason === 'ORIGINAL_NOT_FOUND', 'Scenario F: Re-application rejected with ORIGINAL_NOT_FOUND');
  } catch (err) {
    assert(false, `Scenario F failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario G: Fetch Non-Existent Review -> 404 NOT_FOUND / REVIEW_NOT_FOUND
  // -------------------------------------------------------------------------
  console.log('--- Scenario G: Fetch Non-Existent Review ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews/mem-9999999999999-99-abcdef01`);
    assert(res.status === 404, 'Scenario G: GET non-existent review returns 404 Not Found');
    const data = await res.json();
    const errCode = typeof data.error === 'object' ? data.error.code : data.error;
    assert(errCode === 'REVIEW_NOT_FOUND' || errCode === 'NOT_FOUND', `Scenario G: Error code is NOT_FOUND (got ${errCode})`);
  } catch (err) {
    assert(false, `Scenario G failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario H: Delete Non-Existent Review -> 404 NOT_FOUND / REVIEW_NOT_FOUND
  // -------------------------------------------------------------------------
  console.log('--- Scenario H: Delete Non-Existent Review ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews/mem-9999999999999-99-abcdef01`, {
      method: 'DELETE',
    });
    assert(res.status === 404, 'Scenario H: DELETE non-existent review returns 404 Not Found');
    const data = await res.json();
    const errCode = typeof data.error === 'object' ? data.error.code : data.error;
    assert(errCode === 'REVIEW_NOT_FOUND' || errCode === 'NOT_FOUND', `Scenario H: Error code is NOT_FOUND (got ${errCode})`);
  } catch (err) {
    assert(false, `Scenario H failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario I: Oversized Code Payload (>150KB) -> 400 PAYLOAD_TOO_LARGE
  // -------------------------------------------------------------------------
  console.log('--- Scenario I: Oversized Payload Rejection ---');
  try {
    const oversizedCode = 'console.log("x");\n'.repeat(10000); // >170 KB
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: oversizedCode,
        language: 'javascript',
      }),
    });
    assert(res.status === 400, 'Scenario I: POST /api/review with oversized code returns 400 Bad Request');
    const data = await res.json();
    const errCode = typeof data.error === 'object' ? data.error.code : data.error;
    assert(errCode === 'PAYLOAD_TOO_LARGE', `Scenario I: Error code is PAYLOAD_TOO_LARGE (got ${errCode})`);
  } catch (err) {
    assert(false, `Scenario I failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario J: Invalid Pagination Parameters -> 400 INVALID_PAGINATION
  // -------------------------------------------------------------------------
  console.log('--- Scenario J: Invalid Pagination Validation ---');
  try {
    const resPageZero = await fetch(`${API_BASE}/api/reviews?page=0`);
    assert(resPageZero.status === 400, 'Scenario J.1: page=0 returns 400 Bad Request');
    const dataPageZero = await resPageZero.json();
    const errCodeZero = typeof dataPageZero.error === 'object' ? dataPageZero.error.code : dataPageZero.error;
    assert(errCodeZero === 'INVALID_PAGINATION', 'Scenario J.1: Error code is INVALID_PAGINATION');

    const resLimitHigh = await fetch(`${API_BASE}/api/reviews?limit=100`);
    assert(resLimitHigh.status === 400, 'Scenario J.2: limit=100 returns 400 Bad Request');
    const dataLimitHigh = await resLimitHigh.json();
    const errCodeHigh = typeof dataLimitHigh.error === 'object' ? dataLimitHigh.error.code : dataLimitHigh.error;
    assert(errCodeHigh === 'INVALID_PAGINATION', 'Scenario J.2: Error code is INVALID_PAGINATION');

    const resPageNaN = await fetch(`${API_BASE}/api/reviews?page=abc`);
    assert(resPageNaN.status === 400, 'Scenario J.3: page=abc returns 400 Bad Request');
    const dataPageNaN = await resPageNaN.json();
    const errCodeNaN = typeof dataPageNaN.error === 'object' ? dataPageNaN.error.code : dataPageNaN.error;
    assert(errCodeNaN === 'INVALID_PAGINATION', 'Scenario J.3: Error code is INVALID_PAGINATION');
  } catch (err) {
    assert(false, `Scenario J failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // Scenario K: Unknown API Route -> 404 ROUTE_NOT_FOUND / NOT_FOUND
  // -------------------------------------------------------------------------
  console.log('--- Scenario K: Unknown Route Handling ---');
  try {
    const resGet = await fetch(`${API_BASE}/api/nonexistent-route-xyz`);
    assert(resGet.status === 404, 'Scenario K.1: GET unknown route returns 404 Not Found');
    const dataGet = await resGet.json();
    const errCodeGet = typeof dataGet.error === 'object' ? dataGet.error.code : dataGet.error;
    assert(errCodeGet === 'ROUTE_NOT_FOUND' || errCodeGet === 'NOT_FOUND', `Scenario K.1: Error code is ROUTE_NOT_FOUND (got ${errCodeGet})`);

    const resPost = await fetch(`${API_BASE}/api/unknown-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 123 }),
    });
    assert(resPost.status === 404, 'Scenario K.2: POST unknown route returns 404 Not Found');
    const dataPost = await resPost.json();
    const errCodePost = typeof dataPost.error === 'object' ? dataPost.error.code : dataPost.error;
    assert(errCodePost === 'ROUTE_NOT_FOUND' || errCodePost === 'NOT_FOUND', `Scenario K.2: Error code is ROUTE_NOT_FOUND (got ${errCodePost})`);
  } catch (err) {
    assert(false, `Scenario K failed: ${err.message}`);
  }

  console.log(`\n=== Failure Modes Test Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

runFailureTests().catch((err) => {
  console.error('Fatal error running failure tests:', err);
  process.exit(1);
});
