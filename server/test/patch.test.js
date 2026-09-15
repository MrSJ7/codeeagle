import { verifyPatch, applyPatch, PATCH_REASONS } from '../src/services/patchService.js';
import { computeReviewDiff } from '../src/services/reviewDiff.js';
import { reviewCode } from '../src/services/reviewService.js';
import { computeCodeHash } from '../src/utils/codeHasher.js';

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

async function runPatchTests() {
  console.log('=== Starting CodeLens Safe Patch & Diff Engine Tests ===\n');

  const sampleCode = [
    'import express from "express";',
    'const app = express();',
    '',
    '// Sensitive configuration',
    'const apiKey = "AKIAIOSFODNN7EXAMPLE";',
    '',
    'app.get("/status", (req, res) => {',
    '  res.send("ok");',
    '});',
  ].join('\n');

  const validSecretIssue = {
    id: 'SEC-SECRET-5',
    rule: 'SEC-SECRET',
    source: 'STATIC',
    severity: 'CRITICAL',
    category: 'SECURITY',
    title: 'Hardcoded credential in apiKey',
    line: 5,
    endLine: 5,
    description: 'Plaintext secret found.',
    recommendation: 'Use process.env.apiKey',
    confidence: 1.0,
    fix: {
      original: 'const apiKey = "AKIAIOSFODNN7EXAMPLE";',
      replacement: 'const apiKey = process.env.apiKey;',
    },
  };

  // --- 1. Exact Match & Safe Patch Application ---
  console.log('--- 1. Exact Match & Safe Patch Application ---');
  const codeHash = computeCodeHash(sampleCode);
  const vResult = verifyPatch({ code: sampleCode, codeHash, issue: validSecretIssue });
  assert(vResult.applicable === true, 'Exact static fix is applicable (Test 1)');
  assert(vResult.reason === null, 'Reason is null on success');
  assert(vResult.startLine === 5, 'Detected startLine is 5');
  assert(vResult.endLine === 5, 'Detected endLine is 5');
  assert(vResult.beforeHash === codeHash, 'beforeHash matches sample code hash (Test 7)');
  assert(typeof vResult.afterHash === 'string' && vResult.afterHash.length === 64, 'afterHash is valid 64-char hex (Test 8)');
  assert(vResult.patchedCode.includes('const apiKey = process.env.apiKey;'), 'patchedCode includes replacement (Test 9)');
  assert(!vResult.patchedCode.includes('AKIAIOSFODNN7EXAMPLE'), 'patchedCode removes secret');

  const applyResult = applyPatch({ code: sampleCode, codeHash, issue: validSecretIssue });
  assert(applyResult.success === true, 'applyPatch succeeds for valid issue');
  assert(applyResult.patchedCode === vResult.patchedCode, 'applyPatch output matches verifyPatch');

  // --- 2. Failure Cases & Controlled Reasons ---
  console.log('\n--- 2. Failure Cases & Controlled Reasons ---');
  
  // Original missing
  const missingIssue = {
    ...validSecretIssue,
    fix: { original: 'const nonExistent = 123;', replacement: 'const foo = 1;' },
  };
  const missingResult = verifyPatch({ code: sampleCode, codeHash, issue: missingIssue });
  assert(missingResult.applicable === false, 'Missing snippet is not applicable (Test 2)');
  assert(missingResult.reason === PATCH_REASONS.ORIGINAL_NOT_FOUND, 'Returns ORIGINAL_NOT_FOUND');

  // Duplicate occurrences
  const duplicateCode = sampleCode + '\nconst apiKey = "AKIAIOSFODNN7EXAMPLE";';
  const duplicateHash = computeCodeHash(duplicateCode);
  const duplicateResult = verifyPatch({ code: duplicateCode, codeHash: duplicateHash, issue: validSecretIssue });
  assert(duplicateResult.applicable === false, 'Duplicate snippet is not applicable (Test 3)');
  assert(duplicateResult.reason === PATCH_REASONS.MULTIPLE_MATCHES, 'Returns MULTIPLE_MATCHES');

  // Stale code hash
  const staleResult = verifyPatch({ code: sampleCode, codeHash: '0000000000000000000000000000000000000000000000000000000000000000', issue: validSecretIssue });
  assert(staleResult.applicable === false, 'Mismatched codeHash rejected (Test 6)');
  assert(staleResult.reason === PATCH_REASONS.STALE_SOURCE, 'Returns STALE_SOURCE');

  // Line range mismatch
  const lineMismatchIssue = {
    ...validSecretIssue,
    line: 8,
    endLine: 8,
  };
  const lineMismatchResult = verifyPatch({ code: sampleCode, codeHash, issue: lineMismatchIssue });
  assert(lineMismatchResult.applicable === false, 'Line mismatch rejected (Test 4)');
  assert(lineMismatchResult.reason === PATCH_REASONS.LINE_RANGE_MISMATCH, 'Returns LINE_RANGE_MISMATCH');

  // Invalid line range
  const invalidRangeIssue = {
    ...validSecretIssue,
    line: 999,
    endLine: 1000,
  };
  const invalidRangeResult = verifyPatch({ code: sampleCode, codeHash, issue: invalidRangeIssue });
  assert(invalidRangeResult.applicable === false, 'Out of bounds line range rejected (Test 5)');
  assert(invalidRangeResult.reason === PATCH_REASONS.INVALID_LINE_RANGE, 'Returns INVALID_LINE_RANGE');

  // Inverted line range
  const invertedRangeIssue = {
    ...validSecretIssue,
    line: 5,
    endLine: 4,
  };
  const invertedRangeResult = verifyPatch({ code: sampleCode, codeHash, issue: invertedRangeIssue });
  assert(invertedRangeResult.applicable === false, 'Inverted line range rejected');
  assert(invertedRangeResult.reason === PATCH_REASONS.INVALID_LINE_RANGE, 'Returns INVALID_LINE_RANGE');

  // AI patch rejection
  const aiIssue = {
    ...validSecretIssue,
    source: 'AI',
    rule: 'AI-SECURITY',
  };
  const aiResult = verifyPatch({ code: sampleCode, codeHash, issue: aiIssue });
  assert(aiResult.applicable === false, 'AI patch application is strictly rejected (Test 10)');
  assert(aiResult.reason === PATCH_REASONS.UNSAFE_AI_FIX, 'Returns UNSAFE_AI_FIX');

  // Unsupported source
  const unsupportedSourceIssue = {
    ...validSecretIssue,
    source: 'THIRD_PARTY',
  };
  const unsupportedResult = verifyPatch({ code: sampleCode, codeHash, issue: unsupportedSourceIssue });
  assert(unsupportedResult.applicable === false, 'Unsupported source rejected');
  assert(unsupportedResult.reason === PATCH_REASONS.UNSUPPORTED_SOURCE, 'Returns UNSUPPORTED_SOURCE');

  // Malformed fix object
  const noFixIssue = { ...validSecretIssue, fix: null };
  const noFixResult = verifyPatch({ code: sampleCode, codeHash, issue: noFixIssue });
  assert(noFixResult.applicable === false, 'Null fix rejected (Test 11)');
  assert(noFixResult.reason === PATCH_REASONS.INVALID_FIX, 'Returns INVALID_FIX');

  // Non-registered rule / fabricated fix
  const fakeRuleIssue = {
    ...validSecretIssue,
    rule: 'FABRICATED-RULE',
  };
  const fakeRuleResult = verifyPatch({ code: sampleCode, codeHash, issue: fakeRuleIssue });
  assert(fakeRuleResult.applicable === false, 'Fabricated rule rejected (Test 12)');
  assert(fakeRuleResult.reason === PATCH_REASONS.INVALID_FIX, 'Returns INVALID_FIX');

  // --- 3. Robustness & String Safety Tests ---
  console.log('\n--- 3. Robustness & String Safety Tests ---');

  // Regex metacharacters in original snippet
  const regexCode = 'const pattern = /test.*+?^${}()|[\\]/g;\nconst x = 1;';
  const regexHash = computeCodeHash(regexCode);
  const regexIssue = {
    ...validSecretIssue,
    line: 1,
    endLine: 1,
    fix: {
      original: 'const pattern = /test.*+?^${}()|[\\]/g;',
      replacement: 'const pattern = /safe/g;',
    },
  };
  const regexResult = verifyPatch({ code: regexCode, codeHash: regexHash, issue: regexIssue });
  assert(regexResult.applicable === true, 'Regex metacharacters in original handled safely without regex errors (Test 20)');
  assert(regexResult.patchedCode.startsWith('const pattern = /safe/g;'), 'Regex pattern patched cleanly');

  // $ characters in replacement (no String.replace $$ or $1 corruption!)
  const dollarIssue = {
    ...validSecretIssue,
    fix: {
      original: 'const apiKey = "AKIAIOSFODNN7EXAMPLE";',
      replacement: 'const price = "$100"; const ref = "$&$$";',
    },
  };
  const dollarResult = verifyPatch({ code: sampleCode, codeHash, issue: dollarIssue });
  assert(dollarResult.applicable === true, '$ characters in replacement are accepted');
  assert(dollarResult.patchedCode.includes('const price = "$100"; const ref = "$&$$";'), '$ characters in replacement preserved literally without corruption (Test 21)');

  // Multiline snippets
  const multilineCode = 'function check() {\n  const a = 1;\n  const b = 2;\n  return a + b;\n}';
  const multilineHash = computeCodeHash(multilineCode);
  const multilineIssue = {
    ...validSecretIssue,
    line: 2,
    endLine: 3,
    fix: {
      original: '  const a = 1;\n  const b = 2;',
      replacement: '  const a = 10;\n  const b = 20;',
    },
  };
  const multilineResult = verifyPatch({ code: multilineCode, codeHash: multilineHash, issue: multilineIssue });
  assert(multilineResult.applicable === true, 'Multiline snippet verified successfully (Test 22)');
  assert(multilineResult.startLine === 2 && multilineResult.endLine === 3, 'Multiline span calculated correctly');
  assert(multilineResult.patchedCode.includes('const a = 10;\n  const b = 20;'), 'Multiline replacement applied cleanly');

  // Whitespace sensitivity
  const wsMismatchIssue = {
    ...validSecretIssue,
    fix: {
      original: 'const   apiKey   = "AKIAIOSFODNN7EXAMPLE";',
      replacement: 'const apiKey = process.env.apiKey;',
    },
  };
  const wsResult = verifyPatch({ code: sampleCode, codeHash, issue: wsMismatchIssue });
  assert(wsResult.applicable === false, 'Whitespace differences are NOT treated as exact matches (Test 23)');
  assert(wsResult.reason === PATCH_REASONS.ORIGINAL_NOT_FOUND, 'Returns ORIGINAL_NOT_FOUND on whitespace variation');

  // Empty replacement (deletion)
  const emptyReplIssue = {
    ...validSecretIssue,
    fix: {
      original: 'const apiKey = "AKIAIOSFODNN7EXAMPLE";',
      replacement: '',
    },
  };
  const emptyReplResult = verifyPatch({ code: sampleCode, codeHash, issue: emptyReplIssue });
  assert(emptyReplResult.applicable === true, 'Empty replacement (code deletion) handled safely (Test 25)');
  assert(!emptyReplResult.patchedCode.includes('apiKey'), 'Snippet was safely deleted');

  // Huge replacement (> 50KB) rejected
  const hugeReplIssue = {
    ...validSecretIssue,
    fix: {
      original: 'const apiKey = "AKIAIOSFODNN7EXAMPLE";',
      replacement: 'A'.repeat(60000),
    },
  };
  const hugeResult = verifyPatch({ code: sampleCode, codeHash, issue: hugeReplIssue });
  assert(hugeResult.applicable === false, 'Huge replacement (> 50KB) rejected (Test 26)');
  assert(hugeResult.reason === PATCH_REASONS.INVALID_FIX, 'Returns INVALID_FIX for oversized replacement');

  // Pure string transformation: No code execution occurs
  const maliciousCode = 'console.log("TEST_EXECUTION_MARKER");';
  const maliciousIssue = {
    ...validSecretIssue,
    line: 1,
    endLine: 1,
    fix: {
      original: 'console.log("TEST_EXECUTION_MARKER");',
      replacement: 'process.exit(1);',
    },
  };
  const maliciousHash = computeCodeHash(maliciousCode);
  const maliciousResult = verifyPatch({ code: maliciousCode, codeHash: maliciousHash, issue: maliciousIssue });
  assert(maliciousResult.applicable === true, 'Patching handles dangerous text without executing it (Test 19)');

  // --- 4. Review Diffing & Automated Re-Analysis ---
  console.log('\n--- 4. Review Diffing & Automated Re-Analysis ---');

  const beforeReview = await reviewCode({ code: sampleCode, language: 'javascript', filename: 'sample.js' });
  assert(beforeReview.issues.some((i) => i.id === 'SEC-SECRET-5'), 'Before-review contains SEC-SECRET-5');
  const initialScore = beforeReview.score;

  // Apply the patch
  const patchExec = applyPatch({ code: sampleCode, codeHash, issue: validSecretIssue });
  assert(patchExec.success === true, 'Patch applied successfully');

  // Run automated re-analysis on patched code
  const afterReview = await reviewCode({ code: patchExec.patchedCode, language: 'javascript', filename: 'sample.js' });
  assert(afterReview.score > initialScore, `Re-analysis score improved: ${initialScore} -> ${afterReview.score} (Test 13, 17, 18)`);
  assert(!afterReview.issues.some((i) => i.id === 'SEC-SECRET-5'), 'Applied issue disappeared from after-review (Test 14)');

  // Compute review diff
  const diff = computeReviewDiff({ beforeReview, afterReview, appliedIssueId: 'SEC-SECRET-5' });
  assert(diff.resolvedIssues.length === 1, 'Exactly 1 resolved issue identified');
  assert(diff.resolvedIssues[0].id === 'SEC-SECRET-5', 'Resolved issue is SEC-SECRET-5');
  assert(diff.appliedIssueResolved === true, 'appliedIssueResolved flag is true');
  assert(diff.scoreBefore === initialScore, 'diff.scoreBefore matches authoritative before review');
  assert(diff.scoreAfter === afterReview.score, 'diff.scoreAfter matches authoritative after review');

  // Remaining issues detection
  const multiIssueCode = [
    'const apiKey = "AKIAIOSFODNN7EXAMPLE";',
    'function bad(x) {',
    '  eval(x);',
    '}',
  ].join('\n');

  const multiBefore = await reviewCode({ code: multiIssueCode, language: 'javascript', filename: 'multi.js' });
  assert(multiBefore.issues.length >= 2, 'Before review contains multiple issues');

  const secretIssueMulti = multiBefore.issues.find((i) => i.rule === 'SEC-SECRET');
  assert(Boolean(secretIssueMulti), 'Found SEC-SECRET issue in multi-issue code');

  const multiPatch = applyPatch({
    code: multiIssueCode,
    codeHash: computeCodeHash(multiIssueCode),
    issue: secretIssueMulti,
  });
  const multiAfter = await reviewCode({ code: multiPatch.patchedCode, language: 'javascript', filename: 'multi.js' });
  const multiDiff = computeReviewDiff({ beforeReview: multiBefore, afterReview: multiAfter, appliedIssueId: secretIssueMulti.id });

  assert(multiDiff.resolvedIssues.some((i) => i.id === secretIssueMulti.id), 'Secret issue resolved');
  assert(multiDiff.remainingIssues.length >= 1, 'Remaining issue (eval) detected (Test 15)');
  assert(multiDiff.remainingIssues.some((i) => i.rule === 'SEC-EVAL'), 'eval issue remains present');

  // New issues detection: simulated introduced issue
  const simulatedAfterWithNew = {
    ...multiAfter,
    issues: [
      ...multiAfter.issues,
      { id: 'QUAL-VAR-10', rule: 'QUAL-VAR', severity: 'LOW', title: 'New var used' },
    ],
  };
  const diffWithNew = computeReviewDiff({ beforeReview: multiBefore, afterReview: simulatedAfterWithNew });
  assert(diffWithNew.newIssues.length === 1, 'Newly introduced issue detected (Test 16)');
  assert(diffWithNew.newIssues[0].id === 'QUAL-VAR-10', 'New issue matches introduced issue');

  console.log(`\n=== Patch Test Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runPatchTests();
