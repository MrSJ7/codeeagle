import { isOriginAllowed } from '../src/app.js';

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

console.log('=== Starting CodeEagle CORS Policy Tests ===\n');

// 1. Production codeeagle domain
assert(isOriginAllowed('https://codeeagle.vercel.app'), 'Allows https://codeeagle.vercel.app');
assert(isOriginAllowed('https://codeeagle.vercel.app/'), 'Allows https://codeeagle.vercel.app with trailing slash');

// 2. Vercel deployment subdomains (preview branches, deployment hashes)
assert(isOriginAllowed('https://code-reviewer-delta-fawn.vercel.app'), 'Allows https://code-reviewer-delta-fawn.vercel.app');
assert(isOriginAllowed('https://code-reviewer-3754f3au7-soumil-s-projects.vercel.app'), 'Allows hashed preview vercel.app domain');
assert(isOriginAllowed('https://feature-branch-preview.vercel.app'), 'Allows arbitrary feature branch vercel.app domain');

// 3. Localhost variants in all environments
assert(isOriginAllowed('http://localhost:5173'), 'Allows http://localhost:5173');
assert(isOriginAllowed('http://localhost:4173'), 'Allows http://localhost:4173');
assert(isOriginAllowed('http://127.0.0.1:5173'), 'Allows http://127.0.0.1:5173');

// 4. Non-browser requests (curl, server-to-server)
assert(isOriginAllowed(null), 'Allows null origin (server-to-server / curl)');
assert(isOriginAllowed(undefined), 'Allows undefined origin');
assert(isOriginAllowed(''), 'Allows empty string origin');

// 5. Block disallowed third-party origins
const origEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
assert(!isOriginAllowed('https://evil-attacker.com'), 'Blocks unauthorized origin in production');
assert(!isOriginAllowed('https://vercel.app.evil.com'), 'Blocks spoofed vercel.app.evil.com');
assert(!isOriginAllowed('http://evil-vercel.app'), 'Blocks non-https evil-vercel.app');
process.env.NODE_ENV = origEnv;

console.log(`\n=== CORS Policy Tests Completed: ${passed} Passed, ${failed} Failed ===\n`);
if (failed > 0) {
  process.exit(1);
}
