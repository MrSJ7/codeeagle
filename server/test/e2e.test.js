import { computeCodeHash } from '../src/utils/codeHasher.js';
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

async function runE2ETests() {
  console.log('=== Starting CodeLens Complete 12-Step End-to-End Workflow Test ===\n');

  let reviewId1 = null;
  let reviewId2 = null;
  let initialHash = null;
  let secretIssue = null;
  let initialReviewData = null;
  let originalCode = `function authenticateUser(req, res) {
  const JWT_SECRET = "super_secret_jwt_key_998822_do_not_share";
  return JWT_SECRET;
}`;

  // Step 1: Submit code with security issue to POST /api/review
  console.log('--- Step 1: Submit code to POST /api/review ---');
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: originalCode,
        language: 'javascript',
        filename: 'auth.js',
      }),
    });
    assert(res.status === 200, 'Step 1: POST /api/review returned 200 OK');
    const data = await res.json();

    // Step 2: Verify review response contract, score, issues, metadata, codeHash, reviewId
    console.log('--- Step 2: Validate review contract, score, hash, and reviewId ---');
    const contract = validateReviewContract(data);
    assert(contract.valid, `Step 2: Canonical review contract valid (errors: ${contract.errors.join(', ')})`);
    assert(data.score === 75, `Step 2: Score is 75 (got ${data.score})`);
    assert(Array.isArray(data.issues) && data.issues.length === 1, 'Step 2: Exactly 1 issue identified');
    secretIssue = data.issues[0];
    assert(secretIssue.rule === 'SEC-SECRET', 'Step 2: Issue rule is SEC-SECRET');
    assert(secretIssue.source === 'STATIC', 'Step 2: Issue source is STATIC');
    assert(Boolean(secretIssue.fix), 'Step 2: Fix is provided for SEC-SECRET');

    // Save initial review data for Step 6 diffing
    initialReviewData = data;
    initialHash = computeCodeHash(originalCode);
    assert(data.metadata.codeHash === initialHash, 'Step 2: metadata.codeHash matches authoritative SHA-256');
    assert(typeof data.reviewId === 'string' && data.reviewId.length > 0, 'Step 2: Response contains non-empty reviewId');
    reviewId1 = data.reviewId;
  } catch (err) {
    assert(false, `Steps 1-2 failed: ${err.message}`);
  }

  // Step 3: Confirm review is persisted in history list: GET /api/reviews
  console.log('--- Step 3: Confirm review persistence in history list ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews?page=1&limit=10`);
    assert(res.status === 200, 'Step 3: GET /api/reviews returned 200 OK');
    const data = await res.json();
    assert(Array.isArray(data.reviews), 'Step 3: Reviews array returned');
    const found = data.reviews.find((r) => r.reviewId === reviewId1);
    assert(Boolean(found), `Step 3: Review ${reviewId1} found in history list`);
    assert(found.score === 75, 'Step 3: History summary score matches 75');
    assert(found.filename === 'auth.js', 'Step 3: Filename matches auth.js');
    assert(found.issueCount === 1, 'Step 3: Issue count matches 1');
  } catch (err) {
    assert(false, `Step 3 failed: ${err.message}`);
  }

  // Step 4: Fetch full persisted review: GET /api/reviews/:reviewId
  console.log('--- Step 4: Fetch full single review by ID ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews/${reviewId1}`);
    assert(res.status === 200, 'Step 4: GET /api/reviews/:reviewId returned 200 OK');
    const fullReview = await res.json();
    assert(fullReview.reviewId === reviewId1, 'Step 4: reviewId matches');
    assert(fullReview.score === 75, 'Step 4: Restored score matches 75');
    assert(fullReview.code === originalCode, 'Step 4: Restored code matches original verbatim');
    assert(fullReview.issues.length === 1, 'Step 4: Restored issues count matches 1');
    assert(fullReview.metadata.codeHash === initialHash, 'Step 4: codeHash matches initial hash');
  } catch (err) {
    assert(false, `Step 4 failed: ${err.message}`);
  }

  // Step 5: Verify static patch candidate: POST /api/patch/verify
  console.log('--- Step 5: Verify static patch candidate ---');
  let verifyResult = null;
  try {
    const res = await fetch(`${API_BASE}/api/patch/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: originalCode,
        codeHash: initialHash,
        issue: secretIssue,
      }),
    });
    assert(res.status === 200, 'Step 5: POST /api/patch/verify returned 200 OK');
    verifyResult = await res.json();
    assert(verifyResult.applicable === true, 'Step 5: Static patch is applicable');
    assert(verifyResult.reason === null, 'Step 5: Reason is null on success');
    assert(verifyResult.beforeHash === initialHash, 'Step 5: beforeHash matches authoritative hash');
    assert(typeof verifyResult.patchedCode === 'string', 'Step 5: patchedCode string generated');
  } catch (err) {
    assert(false, `Step 5 failed: ${err.message}`);
  }

  // Step 6: Apply patch: POST /api/patch/apply
  console.log('--- Step 6: Apply static patch safely ---');
  let postPatchCode = null;
  try {
    const res = await fetch(`${API_BASE}/api/patch/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: originalCode,
        codeHash: initialHash,
        issue: secretIssue,
        beforeReview: initialReviewData,
      }),
    });
    assert(res.status === 200, 'Step 6: POST /api/patch/apply returned 200 OK');
    const applyData = await res.json();
    assert(applyData.success === true, 'Step 6: applyData.success is true');
    postPatchCode = applyData.patchedCode;
    assert(typeof postPatchCode === 'string', 'Step 6: patchedCode is returned');
    assert(!postPatchCode.includes('super_secret_jwt_key_998822_do_not_share'), 'Step 6: Secret removed from patched code');
    assert(postPatchCode.includes('process.env.JWT_SECRET'), 'Step 6: Replacement code present');

    assert(applyData.diff.scoreBefore === 75, 'Step 6: diff.scoreBefore is 75');
    assert(applyData.diff.scoreAfter === 100, 'Step 6: diff.scoreAfter improved to 100');
    assert(applyData.diff.resolvedIssues.length === 1, 'Step 6: Exactly 1 resolved issue');
    assert(applyData.diff.appliedIssueResolved === true, 'Step 6: appliedIssueResolved is true');
    assert(applyData.review.score === 100, 'Step 6: Post-patch re-review score is 100');

    // Step 7: Confirm patch persistence: New reviewId exists for post-patch review
    console.log('--- Step 7: Confirm post-patch reviewId generated and persisted ---');
    assert(typeof applyData.reviewId === 'string' && applyData.reviewId.length > 0, 'Step 7: New reviewId exists for post-patch review');
    assert(applyData.reviewId !== reviewId1, 'Step 7: Post-patch reviewId is distinct from initial reviewId');
    reviewId2 = applyData.reviewId;
  } catch (err) {
    assert(false, `Steps 6-7 failed: ${err.message}`);
  }

  // Step 8: Verify history now contains both reviews
  console.log('--- Step 8: Verify history contains both initial and post-patch reviews ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews?page=1&limit=10`);
    assert(res.status === 200, 'Step 8: GET /api/reviews returned 200 OK');
    const historyData = await res.json();
    const r1 = historyData.reviews.find((r) => r.reviewId === reviewId1);
    const r2 = historyData.reviews.find((r) => r.reviewId === reviewId2);
    assert(Boolean(r1), 'Step 8: Initial audit remains present in history');
    assert(Boolean(r2), 'Step 8: Post-patch audit is present in history');
    assert(r1.score === 75, 'Step 8: Initial audit preserves score 75');
    assert(r2.score === 100, 'Step 8: Post-patch audit preserves score 100');
  } catch (err) {
    assert(false, `Step 8 failed: ${err.message}`);
  }

  // Step 9: Attempt stale patch: POST /api/patch/apply with stale codeHash returns 409 STALE_SOURCE
  console.log('--- Step 9: Attempt stale patch application ---');
  try {
    const res = await fetch(`${API_BASE}/api/patch/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: postPatchCode, // Modified code with old initialHash
        codeHash: initialHash,
        issue: secretIssue,
      }),
    });
    assert(res.status === 409, 'Step 9: Stale patch application rejected with 409 Conflict');
    const staleData = await res.json();
    const errCode = typeof staleData.error === 'object' ? staleData.error.code : staleData.error;
    assert(errCode === 'STALE_SOURCE', `Step 9: Error code is STALE_SOURCE (got ${errCode})`);
  } catch (err) {
    assert(false, `Step 9 failed: ${err.message}`);
  }

  // Step 10: Verify AI patch flow: POST /api/patch/verify-ai returns preview with replacement
  console.log('--- Step 10: Verify AI patch flow preview ---');
  try {
    const aiCandidateIssue = {
      id: 'AI-LOGIC-1-f7a2',
      rule: 'AI-LOGIC',
      source: 'AI',
      severity: 'MEDIUM',
      category: 'QUALITY',
      title: 'Use standard environment variable lookup',
      line: 2,
      endLine: 2,
      description: 'Replace literal with env variable',
      recommendation: 'Use process.env.JWT_SECRET',
      confidence: 0.95,
      fix: {
        original: '  const JWT_SECRET = "super_secret_jwt_key_998822_do_not_share";',
        replacement: '  const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";',
      },
    };

    const res = await fetch(`${API_BASE}/api/patch/verify-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: originalCode,
        codeHash: initialHash,
        issue: aiCandidateIssue,
      }),
    });
    assert(res.status === 200, 'Step 10: POST /api/patch/verify-ai returned 200 OK');
    const aiVerifyData = await res.json();
    assert(aiVerifyData.applicable === true, 'Step 10: AI patch verified as applicable');
    const preview = aiVerifyData.previewCode || aiVerifyData.patchedCode;
    assert(preview && preview.includes('process.env.JWT_SECRET || "dev-secret"'), 'Step 10: AI preview includes replacement');
    assert(aiVerifyData.beforeHash === initialHash, 'Step 10: AI beforeHash matches initial codeHash');
  } catch (err) {
    assert(false, `Step 10 failed: ${err.message}`);
  }

  // Step 11: Clean up: DELETE /api/reviews/:reviewId removes post-patch review
  console.log('--- Step 11: Delete post-patch review ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews/${reviewId2}`, {
      method: 'DELETE',
    });
    assert(res.status === 200, 'Step 11: DELETE /api/reviews/:reviewId returned 200 OK');
    const delData = await res.json();
    assert(delData.success === true, 'Step 11: Delete confirmation success = true');
    assert(delData.reviewId === reviewId2, 'Step 11: Deleted reviewId matches reviewId2');
  } catch (err) {
    assert(false, `Step 11 failed: ${err.message}`);
  }

  // Step 12: Verify deletion: GET /api/reviews/:reviewId returns 404
  console.log('--- Step 12: Verify deleted review is not found ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews/${reviewId2}`);
    assert(res.status === 404, 'Step 12: Fetching deleted review returns 404 Not Found');
    const errData = await res.json();
    const errCode = typeof errData.error === 'object' ? errData.error.code : errData.error;
    assert(errCode === 'REVIEW_NOT_FOUND' || errCode === 'NOT_FOUND', `Step 12: Error code indicates not found (got ${errCode})`);
  } catch (err) {
    assert(false, `Step 12 failed: ${err.message}`);
  }

  console.log(`\n=== E2E Workflow Test Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

runE2ETests().catch((err) => {
  console.error('Fatal error running E2E tests:', err);
  process.exit(1);
});
