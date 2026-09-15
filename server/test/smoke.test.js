import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

async function runSmokeTests() {
  console.log('=== Starting CodeLens Production Deployment Smoke Tests ===\n');

  // 1. Health Check Endpoint & Safe Status Payload
  console.log('--- 1. Health Check & Service Identity ---');
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    assert(res.status === 200, 'GET /api/health returns HTTP 200 OK');
    const data = await res.json();
    assert(data.status === 'ok', 'Health status is "ok"');
    assert(data.service === 'codelens-api', 'Service identifier is "codelens-api"');
    assert(data.persistence === 'memory' || data.persistence === 'mongodb', `Persistence mode reported: ${data.persistence}`);
    assert(data.ai === 'configured' || data.ai === 'not_configured', `AI configuration reported: ${data.ai}`);

    // Verify safe status: no secrets, connection strings, or IPs leaked
    const jsonStr = JSON.stringify(data);
    assert(!jsonStr.includes('mongodb+srv://'), 'Health payload does not leak MongoDB connection string');
    assert(!jsonStr.includes('AIzaSy'), 'Health payload does not leak Google API keys');
    assert(!jsonStr.includes('password'), 'Health payload does not leak passwords');
  } catch (err) {
    assert(false, `Health test failed: ${err.message}`);
  }

  // 2. Rules Registry Endpoint
  console.log('\n--- 2. Rules Registry Catalog ---');
  try {
    const res = await fetch(`${API_BASE}/api/rules`);
    assert(res.status === 200, 'GET /api/rules returns HTTP 200 OK');
    const data = await res.json();
    assert(Array.isArray(data.rules) && data.rules.length === 13, `Rules catalog returned all 13 rules (found ${data.rules?.length})`);
  } catch (err) {
    assert(false, `Rules test failed: ${err.message}`);
  }

  // 3. Review Endpoint Execution & Determinism
  console.log('\n--- 3. Review Engine Core Execution ---');
  let reviewId = null;
  let codeHash = null;
  let secretIssue = null;
  const sampleCode = 'function login() {\n  const secret = "hardcoded_token_secret_12345";\n  return secret;\n}';

  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: sampleCode,
        language: 'javascript',
        filename: 'login.js',
      }),
    });
    assert(res.status === 200, 'POST /api/review returns HTTP 200 OK');
    const data = await res.json();
    assert(typeof data.score === 'number', `Review computed score: ${data.score}`);
    assert(data.metadata && typeof data.metadata.codeHash === 'string', 'Review returned metadata.codeHash');
    assert(typeof data.reviewId === 'string' && data.reviewId.length > 0, `Review persisted with reviewId: ${data.reviewId}`);
    reviewId = data.reviewId;
    codeHash = data.metadata.codeHash;

    secretIssue = data.issues?.find((i) => i.rule === 'SEC-SECRET');
    assert(Boolean(secretIssue), 'Deterministic static engine detected SEC-SECRET vulnerability');
  } catch (err) {
    assert(false, `Review test failed: ${err.message}`);
  }

  // 4. Static-First Fallback Capability (No Gemini Required)
  console.log('\n--- 4. Zero-Dependency Static Fallback ---');
  try {
    const res = await fetch(`${API_BASE}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'function clean() { return 100; }',
        language: 'javascript',
      }),
    });
    assert(res.status === 200, 'POST /api/review succeeds without external AI dependency');
    const data = await res.json();
    assert(data.score === 100, 'Clean code scores 100');
    assert(data.issues.length === 0, 'Clean code produces 0 issues');
  } catch (err) {
    assert(false, `Static fallback test failed: ${err.message}`);
  }

  // 5. History and Persistence Layer
  console.log('\n--- 5. Audit History & Persistence ---');
  try {
    const res = await fetch(`${API_BASE}/api/reviews?page=1&limit=5`);
    assert(res.status === 200, 'GET /api/reviews returns HTTP 200 OK');
    const data = await res.json();
    assert(Array.isArray(data.reviews), 'Reviews array returned in history');
    assert(data.pagination && typeof data.pagination.total === 'number', 'Pagination metadata returned');

    if (reviewId) {
      const singleRes = await fetch(`${API_BASE}/api/reviews/${reviewId}`);
      assert(singleRes.status === 200, 'GET /api/reviews/:reviewId returns single review details');
      const singleData = await singleRes.json();
      assert(singleData.reviewId === reviewId, 'Retrieved review matches requested reviewId');
    }
  } catch (err) {
    assert(false, `History test failed: ${err.message}`);
  }

  // 6. Safe Patch Engine Verification
  console.log('\n--- 6. Safe Patch Engine Verification ---');
  try {
    if (secretIssue && codeHash) {
      const res = await fetch(`${API_BASE}/api/patch/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sampleCode,
          codeHash,
          issue: secretIssue,
        }),
      });
      assert(res.status === 200, 'POST /api/patch/verify returns HTTP 200 OK');
      const verifyData = await res.json();
      assert(verifyData.applicable === true, 'Static patch verified as applicable');
      assert(verifyData.reason === null, 'Patch verification reason is null on success');
    }
  } catch (err) {
    assert(false, `Patch test failed: ${err.message}`);
  }

  // 7. CORS Enforcement: Allowed Origin (localhost)
  console.log('\n--- 7. CORS Configuration ---');
  try {
    const resLocalhost = await fetch(`${API_BASE}/api/health`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert(resLocalhost.status === 200, 'Allowed Origin (http://localhost:5173) accepted by CORS');
    const acao = resLocalhost.headers.get('access-control-allow-origin');
    assert(acao === 'http://localhost:5173', `Access-Control-Allow-Origin header set to requesting origin (got ${acao})`);

    // Non-browser request (no Origin header)
    const resNoOrigin = await fetch(`${API_BASE}/api/health`);
    assert(resNoOrigin.status === 200, 'Non-browser request (no Origin header) accepted cleanly');
  } catch (err) {
    assert(false, `CORS test failed: ${err.message}`);
  }

  // 8. Security Headers
  console.log('\n--- 8. Security Headers ---');
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    assert(res.headers.get('x-content-type-options') === 'nosniff', 'Header X-Content-Type-Options: nosniff present');
    assert(res.headers.get('x-frame-options') === 'DENY', 'Header X-Frame-Options: DENY present');
    assert(res.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Header Referrer-Policy present');
  } catch (err) {
    assert(false, `Security headers test failed: ${err.message}`);
  }

  // 9. Frontend Production Build Artifacts Check
  console.log('\n--- 9. Production Frontend Build Artifacts ---');
  try {
    const distHtmlPath = path.resolve(__dirname, '../../client/dist/index.html');
    const distExists = fs.existsSync(distHtmlPath);
    assert(distExists, 'client/dist/index.html exists and is ready for Vercel deployment');
    if (distExists) {
      const html = fs.readFileSync(distHtmlPath, 'utf8');
      assert(html.includes('<div id="root"></div>'), 'Production index.html contains #root mount element');
    }
  } catch (err) {
    assert(false, `Build artifact test failed: ${err.message}`);
  }

  console.log(`\n=== Deployment Smoke Tests Completed: ${passed} Passed, ${failed} Failed ===\n`);
  if (failed > 0) process.exit(1);
}

runSmokeTests().catch((err) => {
  console.error('Fatal error running smoke tests:', err);
  process.exit(1);
});
