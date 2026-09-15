import { memoryReviewRepository } from '../src/repositories/memoryReviewRepository.js';
import { reviewRepository } from '../src/repositories/reviewRepository.js';
import { connectDatabase, isDatabaseConnected } from '../src/config/database.js';

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

async function runPersistenceTests() {
  console.log('=== Starting CodeLens Persistence & History Tests ===\n');

  // --- 1. Startup & Graceful Degradation ---
  console.log('--- 1. Startup & Graceful Degradation ---');
  
  // Test 1: When MONGODB_URI is not set, connectDatabase returns false and operates in memory mode
  const originalUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  const connectedWithoutUri = await connectDatabase();
  assert(connectedWithoutUri === false, 'connectDatabase returns false when MONGODB_URI is omitted (Test 1)');
  assert(isDatabaseConnected() === false, 'isDatabaseConnected is false');
  assert(reviewRepository.getPersistenceMode() === 'memory', 'reviewRepository falls back cleanly to "memory" mode (Test 1)');

  // Test 2: When MONGODB_URI points to unreachable port, connectDatabase does not crash
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:54321/nonexistent_test_db';
  const connectedWithBadUri = await connectDatabase();
  assert(connectedWithBadUri === false, 'connectDatabase returns false for unreachable host without crashing (Test 2)');
  assert(reviewRepository.getPersistenceMode() === 'memory', 'Falls back to memory mode on unreachable DB');

  // Restore URI
  if (originalUri) {
    process.env.MONGODB_URI = originalUri;
  } else {
    delete process.env.MONGODB_URI;
  }

  // --- 2. Memory Repository Core CRUD ---
  console.log('\n--- 2. Memory Repository Core CRUD ---');
  memoryReviewRepository.clear();

  const sampleReviewData = {
    codeHash: 'a7c6a8ed952147041be86294a00b7a4ca2c732577466920c676e08b4cc7575c5',
    language: 'javascript',
    filename: 'auth.js',
    code: 'const apiKey = "AKIAIOSFODNN7EXAMPLE";\nfunction login() { return true; }',
    score: 75,
    breakdown: { security: 75, quality: 100, performance: 100, complexity: 100 },
    metrics: { lines: 2, functions: 1, branches: 0, complexity: 1, maxNesting: 0 },
    issues: [
      {
        id: 'SEC-SECRET-1',
        rule: 'SEC-SECRET',
        source: 'STATIC',
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Hardcoded credential',
        line: 1,
        endLine: 1,
        description: 'Plaintext key',
        recommendation: 'Use env',
        confidence: 1.0,
        fix: { original: 'const apiKey = "AKIAIOSFODNN7EXAMPLE";', replacement: 'const apiKey = process.env.apiKey;' },
      },
    ],
    summary: { totalIssues: 1, critical: 1, high: 0, medium: 0, low: 0 },
    metadata: {
      engine: 'static',
      aiStatus: 'UNAVAILABLE',
      language: 'javascript',
      filename: 'auth.js',
      codeHash: 'a7c6a8ed952147041be86294a00b7a4ca2c732577466920c676e08b4cc7575c5',
    },
  };

  // Test 3: Create review
  const created = await reviewRepository.createReview(sampleReviewData);
  assert(Boolean(created), 'createReview stores audit record (Test 3)');
  assert(typeof created.reviewId === 'string' && created.reviewId.length > 5, 'Review receives non-empty reviewId (Test 4)');
  assert(created.codeHash === sampleReviewData.codeHash, 'codeHash stored accurately (Test 16)');
  assert(created.createdAt instanceof Date || typeof created.createdAt === 'string', 'createdAt timestamp is present (Test 17)');
  assert(!JSON.stringify(created).includes('GEMINI_API_KEY'), 'No API secrets stored in audit document (Test 18)');

  // Test 4: Single review retrieval
  const retrieved = await reviewRepository.getReviewById(created.reviewId);
  assert(Boolean(retrieved), 'getReviewById fetches single review (Test 7)');
  assert(retrieved.reviewId === created.reviewId, 'retrieved.reviewId matches created.reviewId');
  assert(retrieved.code === sampleReviewData.code, 'Full single-review payload contains source code (Test 13)');
  assert(retrieved.issues.length === 1, 'Full single-review payload contains issues');
  assert(retrieved.score === 75, 'Saved score is preserved without recalculation');

  // Test 5: Unknown review returns null
  const unknown = await reviewRepository.getReviewById('mem-unknown-id-999');
  assert(unknown === null, 'Unknown reviewId returns null (Test 9)');

  // Test 6: Delete review
  const deleted = await reviewRepository.deleteReviewById(created.reviewId);
  assert(deleted === true, 'deleteReviewById returns true on success (Test 10)');
  const afterDelete = await reviewRepository.getReviewById(created.reviewId);
  assert(afterDelete === null, 'Deleted review is no longer retrievable');

  // Test 7: Delete unknown review returns false
  const deleteUnknown = await reviewRepository.deleteReviewById('mem-unknown-id-999');
  assert(deleteUnknown === false, 'Deleting non-existent review returns false (Test 11)');

  // --- 3. Pagination & Compact History Projection ---
  console.log('\n--- 3. Pagination & Compact History Projection ---');
  memoryReviewRepository.clear();

  // Seed 25 reviews
  for (let i = 1; i <= 25; i++) {
    await reviewRepository.createReview({
      ...sampleReviewData,
      filename: `file_${i}.js`,
      score: 50 + (i % 50),
      createdAt: new Date(Date.now() + i * 1000),
    });
  }

  // Page 1 with limit 10
  const historyPage1 = await reviewRepository.getReviews({ page: 1, limit: 10 });
  assert(historyPage1.reviews.length === 10, 'History page 1 returns exactly 10 reviews (Test 5, 6)');
  assert(historyPage1.pagination.total === 25, 'Total records count is 25');
  assert(historyPage1.pagination.pages === 3, 'Total pages calculated as 3');
  assert(historyPage1.pagination.page === 1, 'Current page is 1');
  assert(historyPage1.pagination.limit === 10, 'Limit is 10');

  // Compact projection verification: does NOT contain full code or raw issues array
  const firstItem = historyPage1.reviews[0];
  assert(firstItem.reviewId !== undefined, 'Compact review has reviewId');
  assert(firstItem.score !== undefined, 'Compact review has score');
  assert(firstItem.filename !== undefined, 'Compact review has filename');
  assert(firstItem.issueCount !== undefined, 'Compact review has issueCount');
  assert(firstItem.engine !== undefined, 'Compact review has engine');
  assert(firstItem.code === undefined, 'Compact projection does NOT leak full code (Test 12)');
  assert(firstItem.issues === undefined, 'Compact projection does NOT leak full issues array (Test 12)');

  // Page 3 (remaining 5)
  const historyPage3 = await reviewRepository.getReviews({ page: 3, limit: 10 });
  assert(historyPage3.reviews.length === 5, 'History page 3 returns remaining 5 records');

  // Order check: descending by createdAt (most recent first)
  const isSorted = historyPage1.reviews.every((rev, idx, arr) => {
    if (idx === 0) return true;
    return new Date(rev.createdAt) <= new Date(arr[idx - 1].createdAt);
  });
  assert(isSorted, 'History is sorted in descending order of createdAt');

  // --- 4. Patch + Re-Review Separate Persistence ---
  console.log('\n--- 4. Patch + Re-Review Separate Persistence ---');
  const reviewA = await reviewRepository.createReview({
    ...sampleReviewData,
    score: 75,
    filename: 'patch_test.js',
  });

  const reviewB = await reviewRepository.createReview({
    ...sampleReviewData,
    score: 100,
    filename: 'patch_test.js',
    issues: [],
    summary: { totalIssues: 0, critical: 0, high: 0, medium: 0, low: 0 },
  });

  assert(reviewA.reviewId !== reviewB.reviewId, 'Patch-generated review receives distinct reviewId (Test 15)');
  const fetchedA = await reviewRepository.getReviewById(reviewA.reviewId);
  const fetchedB = await reviewRepository.getReviewById(reviewB.reviewId);
  assert(fetchedA.score === 75, 'Initial review remains untouched at score 75');
  assert(fetchedB.score === 100, 'Post-patch review exists separately at score 100');

  console.log(`\n=== Persistence Test Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runPersistenceTests();
