import assert from 'node:assert/strict';
import { analyzeCode } from '../src/analyzers/analyzeCode.js';
import { calculateScores } from '../src/services/scoreCalculator.js';
import { verifyPatch } from '../src/services/patchService.js';

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
assert.equal(styleReview.score, 98, 'Two low-impact style findings have small deductions');
assert.deepEqual(
  { score: styleReview.score, breakdown: styleReview.breakdown },
  calculateScores(styleReview.issues),
  'Static and hybrid scoring use the same calculator',
);
assert.equal(analyzeCode('const JWT_SECRET = "super_secret_token_123456";').score, 75);

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
