import assert from 'node:assert/strict';
import { analyzeCode } from '../src/analyzers/analyzeCode.js';
import { calculateScores } from '../src/services/scoreCalculator.js';
import { verifyPatch } from '../src/services/patchService.js';
import { reviewCode } from '../src/services/reviewService.js';
import { calculateProjectScore } from '../src/services/projectScoreCalculator.js';

const hooks = `
function Account({ account, region }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    setCount(account.id);
    console.log(region, ref.current);
  }, [account]);
}
`;
const hookReview = analyzeCode(hooks, 'jsx');
const dependency = hookReview.issues.find((issue) => issue.rule === 'REACT-HOOK-DEPS');
assert.ok(dependency, 'Nonempty arrays still get checked');
assert.match(dependency.title, /region/);
assert.doesNotMatch(dependency.title, /setCount|ref|account/);
assert.equal(dependency.fix, null, 'Dependency changes require manual behavior review');

const scopedKeys = analyzeCode(`
function A({ items }) { return items.map((item, index) => <p key={index}>{item.name}</p>); }
function B({ index }) { return <p key={index}>Unrelated</p>; }
`, 'jsx');
assert.equal(scopedKeys.issues.filter((issue) => issue.rule === 'REACT-INDEX-KEY').length, 1);

const commentIsNotCleanup = analyzeCode(`function C() {
  useEffect(() => {
    window.addEventListener('resize', onResize);
    // removeEventListener will be added later
  }, []);
}`);
assert.ok(commentIsNotCleanup.issues.some((issue) => issue.rule === 'PERF-EFFECT-CLEANUP'));
const realCleanup = analyzeCode(`function C() {
  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
}`);
assert.ok(!realCleanup.issues.some((issue) => issue.rule === 'PERF-EFFECT-CLEANUP'));
assert.ok(!analyzeCode('if (value == null) handleMissing();').issues.some((issue) => issue.rule === 'QUAL-EQEQ'));

const styleReview = analyzeCode('var first = 1;\nvar second = 2;');
assert.equal(styleReview.score, 100, 'Low-impact style suggestions do not reduce the defect score');
assert.ok(styleReview.issues.length === 2, 'Style suggestions remain visible as advisories');
const projectAdvisory = calculateProjectScore(styleReview.issues.map((issue) => ({ ...issue, path: 'example.js' })), 1);
assert.equal(projectAdvisory.score, 100, 'Project health also ignores low-impact style suggestions');
assert.equal(projectAdvisory.topPriorities.length, 0, 'Project priorities exclude advisories');
assert.ok(analyzeCode('items.forEach(async (item) => { await save(item); });').issues.some((issue) => issue.rule === 'QUAL-ASYNC-FOREACH'), 'Async forEach is flagged as a correctness risk');
assert.ok(analyzeCode(`useEffect(() => {
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('scroll', onResize);
}, []);`).issues.some((issue) => issue.rule === 'PERF-EFFECT-CLEANUP'), 'Cleanup with a mismatched event does not suppress the issue');
assert.deepEqual(
  { score: styleReview.score, breakdown: styleReview.breakdown },
  calculateScores(styleReview.issues),
  'Static and hybrid scoring use the same calculator',
);
assert.equal(analyzeCode('const JWT_SECRET = "super_secret_token_123456";').score, 75);

const pgSource = `import { Pool } from 'pg';
const db = new Pool();
const id = req.params.id;
db.query(\`SELECT * FROM users WHERE id = \${id}\`);`;
const pgReview = await reviewCode({ code: pgSource });
const sqlIssue = pgReview.issues.find((issue) => issue.rule === 'SEC-SQLI');
assert.ok(sqlIssue?.fix, 'PostgreSQL SQL injection receives a patch candidate');
assert.equal(verifyPatch({ code: pgSource, codeHash: pgReview.metadata.codeHash, issue: sqlIssue }).applicable, true);
assert.ok(!analyzeCode(verifyPatch({ code: pgSource, issue: sqlIssue }).patchedCode).issues.some((issue) => issue.rule === 'SEC-SQLI'), 'SQL patch removes the flagged query construction');
assert.equal(analyzeCode('db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);').issues.find((issue) => issue.rule === 'SEC-SQLI')?.fix, null, 'Unknown database dialect does not receive a guessed patch');
assert.equal(analyzeCode(`import { Pool } from 'pg'; const db = new Pool(); db.query(\`SELECT * FROM \${table}\`);`).issues.find((issue) => issue.rule === 'SEC-SQLI')?.fix, null, 'SQL identifier interpolation does not receive a value-binding patch');

const listenerSource = `function Feed() { useEffect(() => {
  const onResize = () => update();
  window.addEventListener('resize', onResize);
}, []); }`;
const listenerReview = await reviewCode({ code: listenerSource, language: 'jsx' });
const listenerIssue = listenerReview.issues.find((issue) => issue.rule === 'PERF-EFFECT-CLEANUP');
assert.ok(listenerIssue?.fix, 'Named listener without cleanup receives a patch');
assert.equal(verifyPatch({ code: listenerSource, codeHash: listenerReview.metadata.codeHash, issue: listenerIssue }).applicable, true);
assert.ok(!analyzeCode(verifyPatch({ code: listenerSource, issue: listenerIssue }).patchedCode, 'jsx').issues.some((issue) => issue.rule === 'PERF-EFFECT-CLEANUP'), 'Listener patch removes the lifecycle defect');
const asyncSource = 'async function saveAll() { const items = [1, 2]; items.forEach(async (item) => { await save(item); }); }';
const asyncReview = await reviewCode({ code: asyncSource });
const asyncIssue = asyncReview.issues.find((issue) => issue.rule === 'QUAL-ASYNC-FOREACH');
assert.ok(asyncIssue?.fix, 'Proven array async forEach receives a waiting patch');
assert.ok(!analyzeCode(verifyPatch({ code: asyncSource, issue: asyncIssue }).patchedCode).issues.some((issue) => issue.rule === 'QUAL-ASYNC-FOREACH'), 'Async patch removes ignored promises');
assert.equal(analyzeCode('async function saveAll(items) { items.forEach(async (item) => save(item)); }').issues.find((issue) => issue.rule === 'QUAL-ASYNC-FOREACH')?.fix, null, 'Unknown collection type does not receive a guessed array patch');

const debuggerSource = 'function run() {\n  debugger;\n  return 1;\n}';
const debuggerReview = analyzeCode(debuggerSource);
const debuggerIssue = debuggerReview.issues.find((issue) => issue.rule === 'QUAL-DEBUGGER');
assert.ok(debuggerIssue.fix, 'An isolated debugger statement has a safe deterministic edit');
assert.equal(
  verifyPatch({ code: debuggerSource, codeHash: debuggerReview.metadata.codeHash, issue: debuggerIssue }).applicable,
  true,
);
assert.equal(
  analyzeCode('if (ready) debugger;').issues.find((issue) => issue.rule === 'QUAL-DEBUGGER')?.fix,
  null,
  'Deleting the only statement of an if branch is not offered as a fix',
);

console.log('=== Review Accuracy Tests Passed ===');
