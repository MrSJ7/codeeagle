import { validateReviewContract } from '../src/utils/contractValidator.js';

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

async function runApiTests() {
  console.log('=== Starting CodeLens API Integration & Contract Tests ===\n');

  // Test 1: GET /api/health
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    assert(res.status === 200, 'GET /api/health returns 200 OK');
    const data = await res.json();
    assert(data.status === 'ok' && (data.service === 'codelens-api' || data.service === 'code-reviewer-server'), 'Health payload matches expected structure');
    assert(data.ai === 'configured' || data.ai === 'not_configured', 'Health payload reports AI configuration');
  } catch (err) {
    assert(false, `GET /api/health failed: ${err.message}`);
  }

  // Test 2: GET /api/rules
  try {
    const res = await fetch(`${API_BASE}/api/rules`);
    assert(res.status === 200, 'GET /api/rules returns 200 OK');
    const data = await res.json();
    assert(Array.isArray(data.rules), 'Rules response contains rules array');
    assert(data.rules.length === 13, `Registry contains all 13 expected rules (found ${data.rules.length})`);
    
    const allHaveFields = data.rules.every(r => r.rule && r.category && r.severity && r.title && r.description && r.recommendation);
    assert(allHaveFields, 'Every rule contains rule, category, severity, title, description, and recommendation');

    const expectedSeverities = {
      'SEC-SECRET': 'CRITICAL',
      'SEC-SQLI': 'CRITICAL',
      'SEC-EVAL': 'CRITICAL',
      'SEC-FN-CTOR': 'HIGH',
      'SEC-DANGEROUS-HTML': 'HIGH',
      'COMP-HIGH': 'HIGH',
      'COMP-NESTING': 'HIGH',
      'REACT-HOOK-DEPS': 'HIGH',
      'PERF-EFFECT-CLEANUP': 'HIGH',
      'QUAL-EMPTY-CATCH': 'MEDIUM',
      'QUAL-LENGTH': 'LOW',
      'QUAL-VAR': 'LOW',
      'REACT-INDEX-KEY': 'LOW',
    };

    let severitiesMatch = true;
    for (const rule of data.rules) {
      if (expectedSeverities[rule.rule] !== rule.severity) {
        severitiesMatch = false;
        break;
      }
    }
    assert(severitiesMatch, 'Every rule matches the canonical project severity policy in /api/rules');
  } catch (err) {
    assert(false, `GET /api/rules failed: ${err.message}`);
  }

  // Test 3: POST /api/review with valid JavaScript - Canonical Schema Verification
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'const a = 1;\nfunction test() { return a + 1; }',
        language: 'javascript',
        filename: 'calc.js',
      }),
    });
    assert(res.status === 200, 'POST /api/review with valid JS returns 200 OK');
    const data = await res.json();

    // Top-level schema validation
    assert('score' in data, 'Response contains "score"');
    assert('breakdown' in data, 'Response contains "breakdown"');
    assert('metrics' in data, 'Response contains "metrics"');
    assert('issues' in data, 'Response contains "issues"');
    assert('summary' in data, 'Response contains "summary"');
    assert('metadata' in data, 'Response contains "metadata"');

    // Metrics contract
    assert(typeof data.metrics.lines === 'number', 'metrics.lines is a number');
    assert(typeof data.metrics.functions === 'number', 'metrics.functions is a number');
    assert(typeof data.metrics.branches === 'number', 'metrics.branches is a number');
    assert(typeof data.metrics.complexity === 'number', 'metrics.complexity is a number');
    assert(typeof data.metrics.maxNesting === 'number', 'metrics.maxNesting is a number');
    assert(data.metrics.loc === undefined, 'metrics does NOT contain deprecated "loc"');
    assert(data.metrics.cyclomaticComplexity === undefined, 'metrics does NOT contain deprecated "cyclomaticComplexity"');

    // Metadata contract
    assert(data.metadata.engine === 'static', 'metadata.engine is "static"');
    assert(data.metadata.language === 'javascript', 'metadata.language is "javascript"');
    assert(data.metadata.filename === 'calc.js', 'metadata.filename is "calc.js"');
    assert(typeof data.metadata.codeHash === 'string' && data.metadata.codeHash.length === 64, 'metadata.codeHash is 64 hex characters');
    assert(data.metadata.timestamp === undefined, 'metadata does NOT contain non-deterministic "timestamp"');
    assert(data.metadata.version === undefined, 'metadata does NOT contain extra "version"');

    // Breakdown contract
    assert(typeof data.breakdown.security === 'number', 'breakdown.security is a number');
    assert(typeof data.breakdown.quality === 'number', 'breakdown.quality is a number');
    assert(typeof data.breakdown.performance === 'number', 'breakdown.performance is a number');
    assert(typeof data.breakdown.complexity === 'number', 'breakdown.complexity is a number');

    // Full contract validator check
    const contract = validateReviewContract(data);
    assert(contract.valid, `API response passes canonical contract validation (errors: ${contract.errors.join(', ')})`);
  } catch (err) {
    assert(false, `POST /api/review valid JS failed: ${err.message}`);
  }

  // Test 4: POST /api/review with valid JSX
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'export const Button = () => <button className="btn">Click</button>;',
        language: 'jsx',
        filename: 'Button.jsx',
      }),
    });
    assert(res.status === 200, 'POST /api/review with valid JSX returns 200 OK');
    const data = await res.json();
    assert(data.metadata.language === 'jsx', 'Metadata identifies language as jsx');
    assert(data.score === 100, 'Valid clean JSX scores 100');
    const contract = validateReviewContract(data);
    assert(contract.valid, 'Clean JSX response passes canonical contract validation');
  } catch (err) {
    assert(false, `POST /api/review valid JSX failed: ${err.message}`);
  }

  // Test 5: Empty source rejection (400)
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '' }),
    });
    assert(res.status === 400, 'Empty code returns 400 Bad Request');
    const data = await res.json();
    const errMsg = typeof data.error === 'object' ? data.error.message : data.error;
    assert(errMsg.includes('empty'), 'Empty code error message is clear');
  } catch (err) {
    assert(false, `Empty source test failed: ${err.message}`);
  }

  // Test 6: Whitespace-only source rejection (400)
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '    \n\n\t  ' }),
    });
    assert(res.status === 400, 'Whitespace-only code returns 400 Bad Request');
  } catch (err) {
    assert(false, `Whitespace source test failed: ${err.message}`);
  }

  // Test 7: Unsupported language rejection (400)
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'def hello(): pass', language: 'python' }),
    });
    assert(res.status === 400, 'Unsupported language (python) returns 400 Bad Request');
    const data = await res.json();
    const errMsg = typeof data.error === 'object' ? data.error.message : data.error;
    assert(errMsg.includes('Unsupported language'), 'Unsupported language error message is informative');
  } catch (err) {
    assert(false, `Unsupported language test failed: ${err.message}`);
  }

  // Test 8: Language normalization ('js' -> 'javascript')
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'const x = 1;', language: 'js' }),
    });
    assert(res.status === 200, 'POST /api/review with language "js" accepted');
    const data = await res.json();
    assert(data.metadata.language === 'javascript', 'Language "js" normalized to "javascript"');
  } catch (err) {
    assert(false, `Language normalization test failed: ${err.message}`);
  }

  // Test 9: Syntax error handling (200 with score 0 and structured SYNTAX issue)
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'const bad = { ;' }),
    });
    assert(res.status === 200, 'Syntax error returns 200 with structured analysis instead of crashing');
    const data = await res.json();
    assert(data.score === 0, 'Syntax error sets overall score to 0');
    assert(data.issues.length === 1 && data.issues[0].rule === 'SYNTAX', 'Contains single SYNTAX issue');
    assert(data.issues[0].source === 'STATIC', 'SYNTAX issue source is "STATIC"');
    assert(data.issues[0].category === 'QUALITY', 'SYNTAX issue category is "QUALITY" (no syntax category created)');
    assert(data.summary.totalIssues === 1 && data.summary.critical === 1, 'Summary reflects syntax issue');
    const contract = validateReviewContract(data);
    assert(contract.valid, 'Syntax error response satisfies canonical review contract');
  } catch (err) {
    assert(false, `Syntax error test failed: ${err.message}`);
  }

  // Test 10: Oversized request rejection (400)
  try {
    const hugeCode = 'const x = 1;\n'.repeat(15000); // > 150KB
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: hugeCode }),
    });
    assert(res.status === 400, 'Oversized payload (>150KB) returns 400 Bad Request');
  } catch (err) {
    assert(false, `Oversized request test failed: ${err.message}`);
  }

  // Test 11: Vulnerable source code with full issue contract inspection
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'const JWT_SECRET = "super_production_secret_key_889900";\nconst q = `SELECT * FROM users WHERE id = ${id}`;',
      }),
    });
    const data = await res.json();
    assert(data.score === 50, `Vulnerable source correctly penalized (score = ${data.score})`);
    assert(data.issues.length === 2, `Detected 2 critical security issues (got ${data.issues.length})`);
    assert(data.summary.critical === 2, 'Summary reports 2 critical issues');
    assert(data.metadata.codeHash.length === 64, 'Generated codeHash for review identity');

    // Inspect issue fields
    const requiredIssueFields = [
      'id', 'rule', 'source', 'severity', 'category', 'title',
      'line', 'endLine', 'description', 'recommendation', 'confidence', 'fix'
    ];
    for (const issue of data.issues) {
      for (const field of requiredIssueFields) {
        assert(field in issue, `Issue ${issue.id} contains field "${field}"`);
      }
      assert(issue.source === 'STATIC', `Issue ${issue.id} source is exactly "STATIC"`);
      assert(issue.severity === issue.severity.toUpperCase(), `Issue ${issue.id} severity is uppercase`);
      assert(Number.isInteger(issue.line) && issue.line >= 1, `Issue ${issue.id} line is integer >= 1`);
      assert(Number.isInteger(issue.endLine) && issue.endLine >= issue.line, `Issue ${issue.id} endLine >= line`);
      assert(issue.confidence >= 0 && issue.confidence <= 1, `Issue ${issue.id} confidence is between 0 and 1`);
    }

    const contract = validateReviewContract(data);
    assert(contract.valid, 'Vulnerable code review response satisfies canonical review contract');
  } catch (err) {
    assert(false, `Vulnerable source test failed: ${err.message}`);
  }

  // Test 12: Byte-for-byte API determinism over 5 repeated requests
  try {
    const payload = {
      code: 'const JWT_SECRET = "super_production_secret_key_889900";\nconst a = 1;',
      language: 'javascript',
      filename: 'auth.js',
    };

    const getCanonicalReview = async () => {
      const res = await (await fetch(`${API_BASE}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })).json();
      const { reviewId, ...canonical } = res;
      return JSON.stringify(canonical);
    };

    const res1 = await getCanonicalReview();

    let allIdentical = true;
    for (let i = 2; i <= 5; i++) {
      const nextRes = await getCanonicalReview();
      if (nextRes !== res1) {
        allIdentical = false;
        break;
      }
    }
    assert(allIdentical, '5 repeated API calls return 100% byte-for-byte identical canonical review output (API determinism confirmed)');
  } catch (err) {
    assert(false, `API determinism test failed: ${err.message}`);
  }

  // --- Patch API Tests ---
  try {
    const patchSample = 'const apiKey = "AKIAIOSFODNN7EXAMPLE";\nconst a = 1;';
    const reviewRes = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: patchSample, language: 'javascript', filename: 'auth.js' }),
    });
    const reviewData = await reviewRes.json();
    const secretIssue = reviewData.issues.find((i) => i.rule === 'SEC-SECRET');
    assert(Boolean(secretIssue), 'Found SEC-SECRET issue for patch API test');

    // Test: POST /api/patch/verify (valid)
    const verifyRes = await fetch(`${API_BASE}/api/patch/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: reviewData.metadata.codeHash,
        issue: secretIssue,
      }),
    });
    assert(verifyRes.status === 200, 'POST /api/patch/verify returns 200 OK');
    const verifyData = await verifyRes.json();
    assert(verifyData.applicable === true, 'Verification result is applicable');
    assert(verifyData.reason === null, 'Verification reason is null');

    // Test: POST /api/patch/verify (stale)
    const verifyStaleRes = await fetch(`${API_BASE}/api/patch/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: '1111111111111111111111111111111111111111111111111111111111111111',
        issue: secretIssue,
      }),
    });
    assert(verifyStaleRes.status === 200, 'POST /api/patch/verify stale returns 200 with result');
    const verifyStaleData = await verifyStaleRes.json();
    assert(verifyStaleData.applicable === false && verifyStaleData.reason === 'STALE_SOURCE', 'Stale verify returns STALE_SOURCE');

    // Test: POST /api/patch/apply (valid)
    const applyRes = await fetch(`${API_BASE}/api/patch/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: reviewData.metadata.codeHash,
        issue: secretIssue,
        beforeReview: reviewData,
      }),
    });
    assert(applyRes.status === 200, 'POST /api/patch/apply returns 200 OK');
    const applyData = await applyRes.json();
    assert(applyData.success === true, 'applyData.success is true');
    assert(applyData.patchedCode.includes('process.env.apiKey'), 'Patched code has replacement');
    assert(applyData.diff.scoreBefore === 75, 'Score before was 75');
    assert(applyData.diff.scoreAfter === 100, 'Score after is 100');
    assert(applyData.diff.resolvedIssues.length === 1, '1 issue resolved');

    // Test: POST /api/patch/apply (stale -> 409)
    const applyStaleRes = await fetch(`${API_BASE}/api/patch/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: '0000000000000000000000000000000000000000000000000000000000000000',
        issue: secretIssue,
      }),
    });
    assert(applyStaleRes.status === 409, 'POST /api/patch/apply stale returns 409 Conflict');
    const applyStaleErr = await applyStaleRes.json();
    assert(applyStaleErr.error.code === 'STALE_SOURCE', 'Stale apply error code is STALE_SOURCE');

    // Test: POST /api/patch/apply (AI issue -> 422)
    const aiIssue = { ...secretIssue, source: 'AI', rule: 'AI-SECURITY' };
    const applyAiRes = await fetch(`${API_BASE}/api/patch/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: reviewData.metadata.codeHash,
        issue: aiIssue,
      }),
    });
    assert(applyAiRes.status === 422, 'POST /api/patch/apply AI issue returns 422 Unprocessable Entity');
    const applyAiErr = await applyAiRes.json();
    assert(applyAiErr.error.code === 'UNSAFE_AI_FIX', 'AI patch error code is UNSAFE_AI_FIX');

    // Test: POST /api/patch/apply (malformed -> 400)
    const applyBadRes = await fetch(`${API_BASE}/api/patch/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(applyBadRes.status === 400, 'POST /api/patch/apply empty payload returns 400 Bad Request');

    // --- AI Patch API Tests (Dedicated /verify-ai and /apply-ai) ---
    const validAiCandidate = {
      id: 'AI-LOGIC-1',
      rule: 'AI-LOGIC',
      source: 'AI',
      category: 'QUALITY',
      severity: 'MEDIUM',
      title: 'Fix secret exposure pattern',
      line: 1,
      endLine: 1,
      confidence: 0.90,
      fix: {
        original: 'const apiKey = "AKIAIOSFODNN7EXAMPLE";',
        replacement: 'const apiKey = process.env.API_KEY || "";',
      },
    };

    // Test: POST /api/patch/verify-ai (valid)
    const verifyAiRes = await fetch(`${API_BASE}/api/patch/verify-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: reviewData.metadata.codeHash,
        issue: validAiCandidate,
      }),
    });
    assert(verifyAiRes.status === 200, 'POST /api/patch/verify-ai returns 200 OK');
    const verifyAiData = await verifyAiRes.json();
    assert(verifyAiData.applicable === true, 'AI patch verify returns applicable = true');
    assert(verifyAiData.patchedCode.includes('process.env.API_KEY'), 'AI preview contains replacement');

    // Test: POST /api/patch/verify-ai (low confidence)
    const lowConfAiCandidate = { ...validAiCandidate, confidence: 0.65 };
    const verifyLowConfRes = await fetch(`${API_BASE}/api/patch/verify-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: reviewData.metadata.codeHash,
        issue: lowConfAiCandidate,
      }),
    });
    assert(verifyLowConfRes.status === 200, 'POST /api/patch/verify-ai low conf returns 200 with result');
    const lowConfData = await verifyLowConfRes.json();
    assert(lowConfData.applicable === false, 'Low confidence AI fix is not applicable');
    assert(lowConfData.reason === 'LOW_CONFIDENCE', 'Reason is LOW_CONFIDENCE');

    // Test: POST /api/patch/apply-ai (valid)
    const applyAiSuccessRes = await fetch(`${API_BASE}/api/patch/apply-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: reviewData.metadata.codeHash,
        issue: validAiCandidate,
        language: 'javascript',
        filename: 'service.js',
        beforeReview: reviewData,
      }),
    });
    assert(applyAiSuccessRes.status === 200, 'POST /api/patch/apply-ai returns 200 OK');
    const applyAiSuccessData = await applyAiSuccessRes.json();
    assert(applyAiSuccessData.success === true, 'apply-ai returns success = true');
    assert(applyAiSuccessData.review !== undefined, 'apply-ai returns re-analyzed review');
    assert(applyAiSuccessData.diff !== undefined, 'apply-ai returns review diff');
    assert(applyAiSuccessData.reviewId !== undefined, 'apply-ai generates reviewId');

    // Test: POST /api/patch/apply-ai (stale -> 409)
    const applyAiStaleRes = await fetch(`${API_BASE}/api/patch/apply-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: 'stale-hash-999',
        issue: validAiCandidate,
      }),
    });
    assert(applyAiStaleRes.status === 409, 'POST /api/patch/apply-ai stale returns 409 Conflict');

    // Test: POST /api/patch/apply-ai (STATIC issue -> 422)
    const staticOnAiRes = await fetch(`${API_BASE}/api/patch/apply-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: patchSample,
        codeHash: reviewData.metadata.codeHash,
        issue: { ...validAiCandidate, source: 'STATIC' },
      }),
    });
    assert(staticOnAiRes.status === 422, 'POST /api/patch/apply-ai STATIC issue returns 422 Unprocessable');
  } catch (err) {
    assert(false, `Patch API test failed: ${err.message}`);
  }

  // --- History & Persistence API Tests ---
  try {
    // 1. Create a review to ensure data exists
    const seedRes = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'function historySeed() { return 42; }',
        language: 'javascript',
        filename: 'history_seed.js',
      }),
    });
    const seedData = await seedRes.json();
    assert(typeof seedData.reviewId === 'string' && seedData.reviewId.length > 0, 'POST /api/review attaches reviewId to response');
    const createdId = seedData.reviewId;

    // 2. GET /api/reviews (paginated history)
    const histRes = await fetch(`${API_BASE}/api/reviews?page=1&limit=10`);
    assert(histRes.status === 200, 'GET /api/reviews returns 200 OK');
    const histData = await histRes.json();
    assert(Array.isArray(histData.reviews), 'History response contains reviews array');
    assert(histData.pagination && typeof histData.pagination.total === 'number', 'Pagination object contains total count');
    assert(histData.pagination.page === 1, 'Pagination page is 1');
    assert(histData.pagination.limit === 10, 'Pagination limit is 10');

    // 3. Compact projection check
    const histItem = histData.reviews.find((r) => r.reviewId === createdId);
    assert(Boolean(histItem), 'Created review found in history list');
    assert(histItem.filename === 'history_seed.js', 'Compact review has filename');
    assert(histItem.score === 100, 'Compact review has score');
    assert(histItem.code === undefined, 'Compact projection omits source code');
    assert(histItem.issues === undefined, 'Compact projection omits full issues array');

    // 4. Invalid query validation
    const badPageRes = await fetch(`${API_BASE}/api/reviews?page=-1`);
    assert(badPageRes.status === 400, 'GET /api/reviews with page < 1 returns 400 Bad Request');
    const badLimitRes = await fetch(`${API_BASE}/api/reviews?limit=999`);
    assert(badLimitRes.status === 400, 'GET /api/reviews with limit > 50 returns 400 Bad Request');

    // 5. GET /api/reviews/:reviewId (full review)
    const singleRes = await fetch(`${API_BASE}/api/reviews/${createdId}`);
    assert(singleRes.status === 200, 'GET /api/reviews/:reviewId returns 200 OK');
    const singleData = await singleRes.json();
    assert(singleData.reviewId === createdId, 'Returned reviewId matches requested ID');
    assert(singleData.code.includes('historySeed'), 'Single review payload includes source code');
    assert(Array.isArray(singleData.issues), 'Single review payload includes issues array');
    assert(typeof singleData.score === 'number', 'Single review includes score');

    // 6. Malformed reviewId -> 400
    const malformedIdRes = await fetch(`${API_BASE}/api/reviews/invalid$id!with@special`);
    assert(malformedIdRes.status === 400, 'GET /api/reviews with malformed ID returns 400 Bad Request');

    // 7. Unknown reviewId -> 404
    const notFoundRes = await fetch(`${API_BASE}/api/reviews/mem-99999999-0000-00000000`);
    assert(notFoundRes.status === 404, 'GET /api/reviews with unknown ID returns 404 Not Found');

    // 8. DELETE /api/reviews/:reviewId (success)
    const delRes = await fetch(`${API_BASE}/api/reviews/${createdId}`, { method: 'DELETE' });
    assert(delRes.status === 200, 'DELETE /api/reviews/:reviewId returns 200 OK');
    const delData = await delRes.json();
    assert(delData.success === true && delData.reviewId === createdId, 'DELETE response confirms success and reviewId');

    // 9. DELETE /api/reviews/:reviewId (already deleted -> 404)
    const delAgainRes = await fetch(`${API_BASE}/api/reviews/${createdId}`, { method: 'DELETE' });
    assert(delAgainRes.status === 404, 'DELETE on already-deleted review returns 404 Not Found');
  } catch (err) {
    assert(false, `History API test failed: ${err.message}`);
  }

  console.log(`\n=== API Test Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runApiTests();
