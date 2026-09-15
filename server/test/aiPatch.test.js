/**
 * CodeLens AI Patch Verification & Safe Application Test Suite.
 * Covers:
 * 1. AI Patch Verification Service (verifyAiPatch)
 * 2. Strict eligibility & confidence thresholds (confidence >= 0.80)
 * 3. Failure reasons & guardrails (LOW_CONFIDENCE, STALE_SOURCE, SPAN_TOO_LARGE, etc.)
 * 4. Safe string manipulation (applyAiPatch)
 * 5. Re-analysis diffing and resolution confirmation
 */
import { verifyAiPatch, applyAiPatch, MIN_AI_CONFIDENCE, MAX_AFFECTED_LINES } from '../src/services/aiPatchVerifier.js';
import { PATCH_REASONS } from '../src/services/patchService.js';
import { computeCodeHash } from '../src/utils/codeHasher.js';
import { computeReviewDiff } from '../src/services/reviewDiff.js';

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

console.log('=== Starting CodeLens AI Patch Verification & Application Tests ===\n');

const sampleCode = `function processOrder(order) {
  if (!order) return null;
  const total = order.price * order.quantity;
  return { total, status: 'processed' };
}
`;

const sampleHash = computeCodeHash(sampleCode);

// 1. Valid AI Patch Verification
console.log('--- 1. Valid AI Patch Verification & String Mutation ---');
{
  const validAiIssue = {
    id: 'AI-LOGIC-3-4f2a',
    rule: 'AI-LOGIC',
    source: 'AI',
    category: 'QUALITY',
    severity: 'MEDIUM',
    title: 'Missing quantity check',
    line: 3,
    endLine: 3,
    confidence: 0.85,
    fix: {
      original: '  const total = order.price * order.quantity;',
      replacement: '  const qty = order.quantity || 1;\n  const total = order.price * qty;',
    },
  };

  const result = verifyAiPatch({
    code: sampleCode,
    codeHash: sampleHash,
    issue: validAiIssue,
  });

  assert(result.applicable === true, 'Valid AI fix is applicable (Test 1)');
  assert(result.reason === null, 'Reason is null on success');
  assert(result.startLine === 3, 'Start line matches line 3');
  assert(result.endLine === 3, 'End line matches line 3');
  assert(result.beforeHash === sampleHash, 'Before hash matches source hash');
  assert(typeof result.afterHash === 'string' && result.afterHash.length === 64, 'After hash is valid SHA-256');
  assert(result.patchedCode.includes('const qty = order.quantity || 1;'), 'Patched code includes replacement');
  assert(!result.patchedCode.includes('const total = order.price * order.quantity;'), 'Patched code replaces original');

  // Application flow
  const applied = applyAiPatch({
    code: sampleCode,
    codeHash: sampleHash,
    issue: validAiIssue,
  });

  assert(applied.success === true, 'applyAiPatch succeeds for valid AI candidate');
  assert(applied.patchedCode === result.patchedCode, 'Applied code matches preview code');
  assert(applied.issueId === validAiIssue.id, 'Returns targeted issueId');
}

// 2. Confidence Threshold Enforcement
console.log('\n--- 2. Confidence Threshold Enforcement ---');
{
  const lowConfIssue = {
    id: 'AI-UNCERTAIN-1',
    rule: 'AI-UNCERTAIN',
    source: 'AI',
    category: 'QUALITY',
    severity: 'LOW',
    title: 'Dubious suggestion',
    line: 3,
    endLine: 3,
    confidence: 0.75, // Below 0.80
    fix: {
      original: '  const total = order.price * order.quantity;',
      replacement: '  const total = order.price * (order.quantity || 0);',
    },
  };

  const result = verifyAiPatch({
    code: sampleCode,
    codeHash: sampleHash,
    issue: lowConfIssue,
  });

  assert(result.applicable === false, 'AI fix with confidence 0.75 is rejected (Test 2)');
  assert(result.reason === PATCH_REASONS.LOW_CONFIDENCE, 'Returns LOW_CONFIDENCE reason');

  const edgeIssue = { ...lowConfIssue, confidence: 0.80 };
  const edgeResult = verifyAiPatch({
    code: sampleCode,
    codeHash: sampleHash,
    issue: edgeIssue,
  });
  assert(edgeResult.applicable === true, 'AI fix with exactly 0.80 confidence is accepted');
}

// 3. Source Integrity & Exact Matching
console.log('\n--- 3. Source Integrity & Exact Matching ---');
{
  const missingSnippetIssue = {
    id: 'AI-MISSING-1',
    rule: 'AI-LOGIC',
    source: 'AI',
    category: 'QUALITY',
    severity: 'HIGH',
    line: 3,
    endLine: 3,
    confidence: 0.90,
    fix: {
      original: 'nonExistentCodeFunctionCall();',
      replacement: 'console.log("safe");',
    },
  };

  const notFound = verifyAiPatch({ code: sampleCode, codeHash: sampleHash, issue: missingSnippetIssue });
  assert(notFound.applicable === false, 'Missing snippet rejected (Test 3)');
  assert(notFound.reason === PATCH_REASONS.ORIGINAL_NOT_FOUND, 'Returns ORIGINAL_NOT_FOUND');

  // Ambiguous snippet (multiple occurrences)
  const codeWithDuplicates = 'let x = 1;\nlet y = 2;\nlet x = 1;\n';
  const dupHash = computeCodeHash(codeWithDuplicates);
  const dupIssue = {
    id: 'AI-DUP-1',
    rule: 'AI-LOGIC',
    source: 'AI',
    category: 'QUALITY',
    severity: 'HIGH',
    line: 1,
    endLine: 1,
    confidence: 0.90,
    fix: {
      original: 'let x = 1;',
      replacement: 'let x = 10;',
    },
  };

  const dupResult = verifyAiPatch({ code: codeWithDuplicates, codeHash: dupHash, issue: dupIssue });
  assert(dupResult.applicable === false, 'Ambiguous snippet rejected (Test 4)');
  assert(dupResult.reason === PATCH_REASONS.MULTIPLE_MATCHES, 'Returns MULTIPLE_MATCHES');

  // Stale source
  const staleResult = verifyAiPatch({ code: sampleCode, codeHash: 'stale-hash-12345', issue: missingSnippetIssue });
  assert(staleResult.applicable === false, 'Stale source rejected (Test 5)');
  assert(staleResult.reason === PATCH_REASONS.STALE_SOURCE, 'Returns STALE_SOURCE');
}

// 4. Line Range & Scope Boundaries
console.log('\n--- 4. Line Range & Scope Boundaries ---');
{
  const lineMismatchIssue = {
    id: 'AI-LINE-MISMATCH',
    rule: 'AI-LOGIC',
    source: 'AI',
    category: 'QUALITY',
    severity: 'MEDIUM',
    line: 1, // Snippet is actually on line 3
    endLine: 1,
    confidence: 0.90,
    fix: {
      original: '  const total = order.price * order.quantity;',
      replacement: '  const total = 0;',
    },
  };

  const lineMismatch = verifyAiPatch({ code: sampleCode, codeHash: sampleHash, issue: lineMismatchIssue });
  assert(lineMismatch.applicable === false, 'Line mismatch rejected (Test 6)');
  assert(lineMismatch.reason === PATCH_REASONS.LINE_RANGE_MISMATCH, 'Returns LINE_RANGE_MISMATCH');

  // Huge line span (> 30 lines)
  const hugeLines = Array.from({ length: 40 }, (_, i) => `// line ${i + 1}`).join('\n');
  const hugeCode = `function test() {\n${hugeLines}\n}\n`;
  const hugeHash = computeCodeHash(hugeCode);

  const hugeSpanIssue = {
    id: 'AI-HUGE-SPAN',
    rule: 'AI-REFACTOR',
    source: 'AI',
    category: 'QUALITY',
    severity: 'HIGH',
    line: 2,
    endLine: 35, // 34 lines span > 30 limit
    confidence: 0.95,
    fix: {
      original: hugeLines,
      replacement: '// condensed',
    },
  };

  const hugeSpanResult = verifyAiPatch({ code: hugeCode, codeHash: hugeHash, issue: hugeSpanIssue });
  assert(hugeSpanResult.applicable === false, 'Line span > 30 rejected (Test 7)');
  assert(hugeSpanResult.reason === PATCH_REASONS.SPAN_TOO_LARGE, 'Returns SPAN_TOO_LARGE');

  // Huge replacement (> 50KB)
  const hugeReplacement = 'x'.repeat(50001);
  const hugeReplIssue = {
    id: 'AI-HUGE-REPL',
    rule: 'AI-LOGIC',
    source: 'AI',
    category: 'QUALITY',
    severity: 'HIGH',
    line: 3,
    endLine: 3,
    confidence: 0.90,
    fix: {
      original: '  const total = order.price * order.quantity;',
      replacement: hugeReplacement,
    },
  };

  const hugeReplResult = verifyAiPatch({ code: sampleCode, codeHash: sampleHash, issue: hugeReplIssue });
  assert(hugeReplResult.applicable === false, 'Replacement > 50KB rejected (Test 8)');
  assert(hugeReplResult.reason === PATCH_REASONS.REPLACEMENT_TOO_LARGE, 'Returns REPLACEMENT_TOO_LARGE');
}

// 5. Source Guard & Malformed Payloads
console.log('\n--- 5. Source Guard & Malformed Payloads ---');
{
  const staticIssue = {
    id: 'SEC-SECRET-1',
    rule: 'SEC-SECRET',
    source: 'STATIC', // Not AI
    category: 'SECURITY',
    severity: 'CRITICAL',
    line: 3,
    endLine: 3,
    confidence: 1.0,
    fix: {
      original: '  const total = order.price * order.quantity;',
      replacement: '  const total = 0;',
    },
  };

  const staticOnAi = verifyAiPatch({ code: sampleCode, codeHash: sampleHash, issue: staticIssue });
  assert(staticOnAi.applicable === false, 'STATIC issue rejected by AI verifier (Test 9)');
  assert(staticOnAi.reason === PATCH_REASONS.UNSAFE_AI_FIX, 'Returns UNSAFE_AI_FIX for non-AI source');

  const nullFixIssue = {
    id: 'AI-NULL-FIX',
    rule: 'AI-LOGIC',
    source: 'AI',
    category: 'QUALITY',
    severity: 'MEDIUM',
    confidence: 0.90,
    fix: null,
  };

  const nullFix = verifyAiPatch({ code: sampleCode, codeHash: sampleHash, issue: nullFixIssue });
  assert(nullFix.applicable === false, 'Null fix rejected (Test 10)');
  assert(nullFix.reason === PATCH_REASONS.INVALID_FIX, 'Returns INVALID_FIX');
}

// 6. Post-AI Patch Review Diffing & Resolution Confirmation
console.log('\n--- 6. Post-AI Patch Review Diffing ---');
{
  const aiIssueId = 'AI-LOGIC-3-4f2a';
  const beforeReview = {
    score: 85,
    issues: [
      { id: aiIssueId, title: 'AI Issue' },
      { id: 'SEC-SECRET-1', title: 'Static Secret' },
    ],
  };

  // Re-analysis after patch shows AI issue was resolved, static issue remains
  const afterReview = {
    score: 93,
    issues: [
      { id: 'SEC-SECRET-1', title: 'Static Secret' },
    ],
  };

  const diff = computeReviewDiff({
    beforeReview,
    afterReview,
    appliedIssueId: aiIssueId,
  });

  assert(diff.appliedIssueResolved === true, 'Re-analysis confirms AI issue is resolved (Test 11)');
  assert(diff.resolvedIssues.length === 1 && diff.resolvedIssues[0].id === aiIssueId, 'Resolved issues contains targeted AI issue');
  assert(diff.remainingIssues.length === 1 && diff.remainingIssues[0].id === 'SEC-SECRET-1', 'Remaining issues retains static secret');
  assert(diff.scoreBefore === 85 && diff.scoreAfter === 93, 'Score improvement recorded: 85 -> 93');
}

console.log(`\n=== AI Patch Tests Completed: ${passed} Passed, ${failed} Failed ===\n`);

if (failed > 0) {
  process.exit(1);
}
