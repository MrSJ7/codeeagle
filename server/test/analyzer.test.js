import { analyzeCode } from '../src/analyzers/analyzeCode.js';

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

console.log('=== Starting CodeLens Deterministic Static Engine Hardening Tests ===\n');

// -------------------------------------------------------------
// METRICS TESTS
// -------------------------------------------------------------
console.log('--- 1. Metrics & AST Traversal Tests ---');

// 1.1 Simple Clean Function
{
  const code = `export function add(a, b) {\n  return a + b;\n}`;
  const res = analyzeCode(code);
  assert(res.metrics.lines === 3, 'Clean function line count is 3');
  assert(res.metrics.functions === 1, 'Clean function count is 1');
  assert(res.metrics.branches === 0, 'Clean function branch count is 0');
  assert(res.metrics.complexity === 1, 'Clean function cyclomatic complexity is 1');
  assert(res.metrics.maxNesting === 0, 'Clean function max nesting is 0');
  assert(res.score === 100, 'Clean function score is 100');
  assert(res.issues.length === 0, 'Clean function produces zero issues');
}

// 1.2 Sibling If Statements (Must NOT accumulate nesting depth)
{
  const code = `
function test(a, b) {
  if (a) {
    console.log('a');
  }
  if (b) {
    console.log('b');
  }
}
  `;
  const res = analyzeCode(code);
  assert(res.metrics.maxNesting === 1, `Sibling ifs produce max nesting = 1 (got ${res.metrics.maxNesting})`);
  assert(res.metrics.branches === 2, `Two if statements produce branches = 2 (got ${res.metrics.branches})`);
  assert(res.metrics.complexity === 3, `Complexity is 1 + 2 = 3 (got ${res.metrics.complexity})`);
}

// 1.3 Nested Functions Scope Isolation
{
  const code = `
function outer() {
  if (true) {}
  function inner() {
    if (1) {}
    if (2) {}
    if (3) {}
  }
}
  `;
  const res = analyzeCode(code);
  // Total branches across file is 4 (1 outer + 3 inner)
  assert(res.metrics.branches === 4, `Total file branches = 4 (got ${res.metrics.branches})`);
}

// 1.4 Ternaries, Loops, Switch Cases, and Logical Operators
{
  const code = `
function complexBranching(x, arr) {
  const a = x > 0 ? 1 : 2; // +1
  for (const item of arr) {} // +1
  while (x > 10) {} // +1
  do {} while (x < 5); // +1
  switch (x) {
    case 1: break; // +1
    case 2: break; // +1
    default: break; // 0
  }
  if (x > 1 && x < 10 || x === 99) {} // +1 (if) + 2 (logical operators &&, ||) = +3
}
  `;
  const res = analyzeCode(code);
  // 1 (ternary) + 1 (for-of) + 1 (while) + 1 (do-while) + 2 (switch cases) + 3 (if + && + ||) = 9
  assert(res.metrics.branches === 9, `All decision points counted accurately (got ${res.metrics.branches}, expected 9)`);
  assert(res.metrics.complexity === 10, `Overall complexity is 10 (got ${res.metrics.complexity})`);
}

// -------------------------------------------------------------
// SECURITY TESTS (Positive & Negative False-Positive Checks)
// -------------------------------------------------------------
console.log('\n--- 2. Security Rules & False-Positive Mitigation Tests ---');

// 2.1 Positive: Real hardcoded secret variable
{
  const code = 'const JWT_SECRET = "super_production_secret_key_889900";';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'SEC-SECRET');
  assert(issue !== undefined, 'Detects actual hardcoded secret');
  assert(issue?.severity === 'CRITICAL', 'Secret severity is CRITICAL');
  assert(issue?.fix?.replacement === 'const JWT_SECRET = process.env.JWT_SECRET;', 'Generates verified replacement fix');
}

// 2.2 Negative: Benign labels / config strings must NOT trigger secret rule
{
  const code = `
const passwordLabel = "Password";
const appName = "CodeLens";
const API_KEY = "development";
const userRole = "admin";
  `;
  const res = analyzeCode(code);
  const secretIssues = res.issues.filter(i => i.rule === 'SEC-SECRET');
  assert(secretIssues.length === 0, `Benign strings (labels, development, appName) do NOT trigger SEC-SECRET (found ${secretIssues.length})`);
}

// 2.3 Positive: Known Token Format (AWS Key)
{
  const code = 'const cloudId = "AKIAIOSFODNN7EXAMPLE";';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'SEC-SECRET');
  assert(issue !== undefined, 'Detects AWS Access Key format directly');
}

// 2.4 Positive: Dangerous eval()
{
  const code = 'eval(userInput);';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'SEC-EVAL');
  assert(issue !== undefined, 'Detects eval() call');
  assert(issue?.severity === 'CRITICAL', 'eval() severity is CRITICAL');
}

// 2.5 Positive: Dynamic Function constructor
{
  const code = 'const fn = new Function("a", "b", "return a + b");';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'SEC-FN-CTOR');
  assert(issue !== undefined, 'Detects new Function() constructor');
  assert(issue?.severity === 'HIGH', 'Function constructor severity is HIGH');
}

// 2.6 Positive: SQL Injection via Template Literal
{
  const code = 'const q = `SELECT * FROM accounts WHERE id = ${accountId}`;';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'SEC-SQLI');
  assert(issue !== undefined, 'Detects dynamic template SQL injection');
  assert(issue?.confidence === 0.85, 'SQL injection has heuristic confidence (0.85)');
}

// 2.7 Positive: SQL Injection via String Concatenation (+)
{
  const code = 'const q = "SELECT * FROM users WHERE email = " + userEmail;';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'SEC-SQLI');
  assert(issue !== undefined, 'Detects string concatenation SQL injection');
}

// 2.8 Negative: Static SQL string without dynamic expressions must NOT trigger
{
  const code = 'const q = "SELECT * FROM users";';
  const res = analyzeCode(code);
  const sqlIssues = res.issues.filter(i => i.rule === 'SEC-SQLI');
  assert(sqlIssues.length === 0, 'Static SQL query without dynamic input does NOT trigger SEC-SQLI');
}

// -------------------------------------------------------------
// REACT-SPECIFIC RULES TESTS
// -------------------------------------------------------------
console.log('\n--- 3. React Rules & Scope Tests ---');

// 3.1 Positive: Array index as key
{
  const code = `
const List = ({ items }) => (
  <div>
    {items.map((item, idx) => (
      <span key={idx}>{item.name}</span>
    ))}
  </div>
);
  `;
  const res = analyzeCode(code, 'jsx');
  const issue = res.issues.find(i => i.rule === 'REACT-INDEX-KEY');
  assert(issue !== undefined, 'Detects map index used as React key');
}

// 3.2 Negative: Stable property used as key must NOT trigger
{
  const code = `
const List = ({ items }) => (
  <div>
    {items.map(item => (
      <span key={item.id}>{item.name}</span>
    ))}
  </div>
);
  `;
  const res = analyzeCode(code, 'jsx');
  const issues = res.issues.filter(i => i.rule === 'REACT-INDEX-KEY');
  assert(issues.length === 0, 'Stable item.id key does NOT trigger REACT-INDEX-KEY');
}

// 3.3 Positive: Missing useEffect dependency
{
  const code = `
function Profile({ userId }) {
  useEffect(() => {
    fetchUserData(userId);
  }, []);
}
  `;
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'REACT-HOOK-DEPS');
  assert(issue !== undefined, "Detects missing 'userId' in useEffect dependency array");
  assert(issue?.fix?.replacement === '}, [userId]);', 'Generates verified replacement with dependency');
}

// 3.4 Negative: Locally declared variable inside useEffect must NOT trigger missing dep
{
  const code = `
function Tracker() {
  useEffect(() => {
    const query = 'local_val';
    console.log(query);
  }, []);
}
  `;
  const res = analyzeCode(code);
  const issues = res.issues.filter(i => i.rule === 'REACT-HOOK-DEPS');
  assert(issues.length === 0, 'Locally declared variable inside effect does NOT trigger REACT-HOOK-DEPS');
}

// 3.5 Positive: Event listener in useEffect without cleanup
{
  const code = `
function Scroller() {
  useEffect(() => {
    window.addEventListener('scroll', () => {});
  }, []);
}
  `;
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'PERF-EFFECT-CLEANUP');
  assert(issue !== undefined, 'Detects addEventListener without cleanup');
  assert(issue?.category === 'PERFORMANCE', 'Cleanup issue is categorized under PERFORMANCE');
}

// 3.6 Negative: Event listener in useEffect WITH cleanup must NOT trigger
{
  const code = `
function Scroller() {
  useEffect(() => {
    const onScroll = () => {};
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
  `;
  const res = analyzeCode(code);
  const issues = res.issues.filter(i => i.rule === 'PERF-EFFECT-CLEANUP');
  assert(issues.length === 0, 'addEventListener WITH removeEventListener does NOT trigger PERF-EFFECT-CLEANUP');
}

// -------------------------------------------------------------
// QUALITY & REFACTOR FIXES TESTS
// -------------------------------------------------------------
console.log('\n--- 4. Quality Rules & Refactor Safety Tests ---');

// 4.1 Empty catch block
{
  const code = 'try { dangerous(); } catch (err) {}';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'QUAL-EMPTY-CATCH');
  assert(issue !== undefined, 'Detects empty catch block');
}

// 4.2 var keyword usage (must have fix: null as specified)
{
  const code = 'var total = 100;';
  const res = analyzeCode(code);
  const issue = res.issues.find(i => i.rule === 'QUAL-VAR');
  assert(issue !== undefined, "Detects 'var' declaration");
  assert(issue?.fix === null, "'var' finding has fix: null to prevent unsafe reassignment breaks");
}

// -------------------------------------------------------------
// DETERMINISM & ERROR HANDLING TESTS
// -------------------------------------------------------------
console.log('\n--- 5. Determinism & Error Handling Tests ---');

// 5.1 Syntax error handling without crash
{
  const code = 'function broken() { if ( }';
  const res = analyzeCode(code);
  assert(res.score === 0, 'Syntax error sets score to 0');
  assert(res.issues.length === 1 && res.issues[0].rule === 'SYNTAX', 'Syntax error returns structured SYNTAX issue');
}

// 5.2 Determinism: 5 repeated runs must produce byte-for-byte identical output
{
  const code = `
const JWT_SECRET = "super_secret_production_key_123456";
export function calculate(order) {
  var total = order.subtotal;
  if (order.coupon) {
    if (order.valid) {
      total -= 10;
    }
  }
  return total;
}
  `;

  const run1 = JSON.stringify(analyzeCode(code));
  let allEqual = true;
  for (let i = 2; i <= 5; i++) {
    const nextRun = JSON.stringify(analyzeCode(code));
    if (nextRun !== run1) {
      allEqual = false;
      break;
    }
  }
  assert(allEqual, '5 repeated runs produce 100% byte-for-byte identical JSON (Determinism confirmed)');
}

// -------------------------------------------------------------
// RULE REGISTRY INTENTIONAL POLICY & CONTRACT INTEGRITY
// -------------------------------------------------------------
console.log('\n--- 6. Canonical Rule Registry Policy & Contract Validation ---');

import { RULE_REGISTRY } from '../src/analyzers/ruleRegistry.js';
import { validateReviewContract } from '../src/utils/contractValidator.js';

{
  const EXPECTED_POLICY = {
    'SEC-SECRET': { severity: 'CRITICAL', category: 'SECURITY' },
    'SEC-SQLI': { severity: 'CRITICAL', category: 'SECURITY' },
    'SEC-EVAL': { severity: 'CRITICAL', category: 'SECURITY' },
    'SEC-FN-CTOR': { severity: 'HIGH', category: 'SECURITY' },
    'SEC-DANGEROUS-HTML': { severity: 'HIGH', category: 'SECURITY' },
    'COMP-HIGH': { severity: 'HIGH', category: 'COMPLEXITY' },
    'COMP-NESTING': { severity: 'HIGH', category: 'COMPLEXITY' },
    'REACT-HOOK-DEPS': { severity: 'HIGH', category: 'QUALITY' },
    'PERF-EFFECT-CLEANUP': { severity: 'HIGH', category: 'PERFORMANCE' },
    'QUAL-EMPTY-CATCH': { severity: 'MEDIUM', category: 'QUALITY' },
    'QUAL-LENGTH': { severity: 'LOW', category: 'QUALITY' },
    'QUAL-VAR': { severity: 'LOW', category: 'QUALITY' },
    'REACT-INDEX-KEY': { severity: 'LOW', category: 'QUALITY' },
  };

  for (const [ruleId, expected] of Object.entries(EXPECTED_POLICY)) {
    const rule = RULE_REGISTRY[ruleId];
    assert(rule !== undefined, `Rule ${ruleId} exists in RULE_REGISTRY`);
    assert(rule.severity === expected.severity, `Rule ${ruleId} severity is ${expected.severity} (got ${rule.severity})`);
    assert(rule.category === expected.category, `Rule ${ruleId} category is ${expected.category} (got ${rule.category})`);
  }

  // Verify validateReviewContract on complex sample
  const sample = analyzeCode('const a = 1;\nfunction f() { return a; }');
  const check = validateReviewContract(sample);
  assert(check.valid, `Canonical review contract holds for standard sample (errors: ${check.errors.join(', ')})`);
}

console.log(`\n=== Final Test Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
