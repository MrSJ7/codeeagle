import { computeCodeHash } from '../src/utils/codeHasher.js';
import { analyzeCode } from '../src/analyzers/analyzeCode.js';
import { verifyPatch, applyPatch } from '../src/services/patchService.js';
import { verifyAiPatch, applyAiPatch } from '../src/services/aiPatchVerifier.js';

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

async function runHashingTests() {
  console.log('=== Starting CodeLens Single-Authority SHA-256 Hashing Tests ===\n');

  // 1. Basic Hash Properties & Determinism
  const codeA = 'const x = 1;\nconsole.log(x);';
  const codeB = 'const x = 1;\nconsole.log(x);';
  const codeC = 'const x = 2;\nconsole.log(x);';

  const hashA1 = computeCodeHash(codeA);
  const hashA2 = computeCodeHash(codeB);
  const hashC = computeCodeHash(codeC);

  assert(typeof hashA1 === 'string', 'computeCodeHash returns a string');
  assert(hashA1.length === 64, 'SHA-256 hash length is exactly 64 characters');
  assert(/^[a-f0-9]{64}$/.test(hashA1), 'SHA-256 hash is lowercase hex characters only');
  assert(hashA1 === hashA2, 'Identical code inputs produce identical hash (determinism)');
  assert(hashA1 !== hashC, 'Different code inputs produce distinct hashes');

  // 2. Edge Cases: Empty, Undefined, Whitespace, Unicode
  const emptyHash = computeCodeHash('');
  assert(emptyHash.length === 64, 'Empty string produces valid 64-char hash');
  assert(computeCodeHash() === emptyHash, 'Default parameter produces empty string hash');
  
  const hashWithLeadingSpace = computeCodeHash(' ' + codeA);
  assert(hashWithLeadingSpace !== hashA1, 'Leading whitespace produces distinct hash');

  const unicodeCode = 'const greeting = "🚀 🌟 Привет мир";';
  const unicodeHash = computeCodeHash(unicodeCode);
  assert(unicodeHash.length === 64, 'Unicode code produces valid 64-char hash');
  assert(unicodeHash === computeCodeHash(unicodeCode), 'Unicode hashing is deterministic');

  // 3. Analyzer Parity
  const analyzed = analyzeCode(codeA, 'javascript', 'test.js');
  assert(analyzed.metadata.codeHash === hashA1, 'analyzeCode metadata.codeHash matches computeCodeHash directly');

  // 4. Static Patch Service Parity
  const sampleVulnerable = 'function auth() {\n  const JWT_SECRET = "super_secret_jwt_key_998822_do_not_share";\n  return JWT_SECRET;\n}';
  const sampleHash = computeCodeHash(sampleVulnerable);
  const staticReview = analyzeCode(sampleVulnerable, 'javascript', 'auth.js');
  const secretIssue = staticReview.issues.find(i => i.rule === 'SEC-SECRET');

  assert(Boolean(secretIssue), 'Found static SEC-SECRET issue for patch hashing test');

  const staticVerify = verifyPatch({
    code: sampleVulnerable,
    codeHash: sampleHash,
    issue: secretIssue
  });

  assert(staticVerify.applicable, 'Static patch is applicable');
  assert(staticVerify.beforeHash === sampleHash, 'verifyPatch beforeHash strictly matches computeCodeHash');
  assert(staticVerify.afterHash === computeCodeHash(staticVerify.patchedCode), 'verifyPatch afterHash matches computeCodeHash(patchedCode)');

  const staticApply = applyPatch({
    code: sampleVulnerable,
    codeHash: sampleHash,
    issue: secretIssue
  });

  assert(staticApply.success, 'applyPatch succeeds');
  assert(staticApply.afterHash === computeCodeHash(staticApply.patchedCode), 'applyPatch afterHash matches computeCodeHash(patchedCode)');
  assert(staticApply.afterHash === staticVerify.afterHash, 'applyPatch afterHash matches verifyPatch afterHash');
  assert(staticApply.beforeHash === sampleHash, 'applyPatch beforeHash matches original codeHash');

  // 5. AI Patch Verifier Parity
  const aiIssue = {
    id: 'AI-LOGIC-1-abc1',
    rule: 'AI-LOGIC',
    source: 'AI',
    severity: 'MEDIUM',
    category: 'QUALITY',
    title: 'Use optional chaining',
    line: 2,
    endLine: 2,
    description: 'Simplify code',
    recommendation: 'Use ?.',
    confidence: 0.9,
    fix: {
      original: '  const JWT_SECRET = "super_secret_jwt_key_998822_do_not_share";',
      replacement: '  const JWT_SECRET = process.env.JWT_SECRET;'
    }
  };

  const aiVerify = verifyAiPatch({
    code: sampleVulnerable,
    codeHash: sampleHash,
    issue: aiIssue
  });

  assert(aiVerify.applicable, 'AI patch is applicable');
  assert(aiVerify.beforeHash === sampleHash, 'verifyAiPatch beforeHash strictly matches computeCodeHash');
  assert(aiVerify.afterHash === computeCodeHash(aiVerify.patchedCode), 'verifyAiPatch afterHash matches computeCodeHash(patchedCode)');

  const aiApply = applyAiPatch({
    code: sampleVulnerable,
    codeHash: sampleHash,
    issue: aiIssue
  });

  assert(aiApply.success, 'applyAiPatch succeeds');
  assert(aiApply.afterHash === computeCodeHash(aiApply.patchedCode), 'applyAiPatch afterHash matches computeCodeHash(patchedCode)');
  assert(aiApply.afterHash === aiVerify.afterHash, 'applyAiPatch afterHash matches verifyAiPatch afterHash');
  assert(aiApply.beforeHash === sampleHash, 'applyAiPatch beforeHash matches original codeHash');

  // 6. Stale Source Rejection via Hash Mismatch
  const staleHash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const staleStaticVerify = verifyPatch({
    code: sampleVulnerable,
    codeHash: staleHash,
    issue: secretIssue
  });
  assert(!staleStaticVerify.applicable && staleStaticVerify.reason === 'STALE_SOURCE', 'Static patch rejected when client hash differs from computeCodeHash');

  const staleAiVerify = verifyAiPatch({
    code: sampleVulnerable,
    codeHash: staleHash,
    issue: aiIssue
  });
  assert(!staleAiVerify.applicable && staleAiVerify.reason === 'STALE_SOURCE', 'AI patch rejected when client hash differs from computeCodeHash');

  console.log(`\n=== Hashing Test Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

runHashingTests().catch(err => {
  console.error('Fatal error running hashing tests:', err);
  process.exit(1);
});
