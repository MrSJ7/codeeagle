/**
 * Walkthrough, Sequence Diagram, Developer Poem, and Chat Service Tests.
 */
import { buildReviewWalkthrough, generateMermaidDiagram, generateDeveloperPoem } from '../src/services/walkthroughService.js';
import { askCodeEagle } from '../src/services/chatService.js';
import { reviewCode } from '../src/services/reviewService.js';

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

async function runTests() {
  console.log('=== Starting CodeEagle Walkthrough & Chat Intelligence Tests ===\n');

  // 1. Mermaid Sequence Diagram Generation
  console.log('--- 1. Mermaid Diagram Generation ---');
  {
    const authDiagram = generateMermaidDiagram({
      code: 'const token = jwt.sign(payload, JWT_SECRET);',
      filename: 'auth.js',
      issues: [{ rule: 'SEC-SECRET' }],
    });
    assert(authDiagram.includes('sequenceDiagram'), 'Diagram starts with sequenceDiagram');
    assert(authDiagram.includes('Auth Controller'), 'Identifies auth controller role');
    assert(authDiagram.includes('⚠️ Risk: Hardcoded secret'), 'Embeds warning note on security risk');

    const reactDiagram = generateMermaidDiagram({
      code: 'useEffect(() => {}, []);',
      filename: 'ActivityFeed.jsx',
      issues: [{ rule: 'REACT-HOOK-DEPS' }],
    });
    assert(reactDiagram.includes('React Component'), 'Identifies React component');
    assert(reactDiagram.includes('⚠️ Warning: Missing deps'), 'Embeds React hook warning');
  }

  // 2. Developer Poem Generation
  console.log('--- 2. Whimsical Developer Poem Generation ---');
  {
    const criticalPoem = generateDeveloperPoem({
      score: 45,
      issues: [{ severity: 'CRITICAL', rule: 'SEC-SECRET' }],
      filename: 'auth.js',
    });
    assert(typeof criticalPoem === 'string' && criticalPoem.length > 20, 'Generates non-empty critical poem');
    assert(criticalPoem.includes('eagle'), 'Poem contains eagle brand motif');

    const cleanPoem = generateDeveloperPoem({
      score: 100,
      issues: [],
      filename: 'clean.js',
    });
    assert(cleanPoem.includes('Approved by CodeEagle'), 'Clean poem congratulates developer');
  }

  // 3. Full Walkthrough Construction
  console.log('--- 3. Full Walkthrough Construction ---');
  {
    const wt = buildReviewWalkthrough({
      code: 'const a = 1;',
      filename: 'auth.js',
      language: 'javascript',
      issues: [{ severity: 'CRITICAL', category: 'SECURITY', rule: 'SEC-SECRET' }],
      score: 50,
      metrics: { lines: 27 },
      summary: {},
    });
    assert(wt.riskLevel === 'CRITICAL', 'Marks critical risk level');
    assert(wt.fileRole === 'Authentication & Security', 'Assigns correct semantic file cohort');
    assert(Boolean(wt.diagram), 'Walkthrough contains Mermaid diagram');
    assert(Boolean(wt.poem), 'Walkthrough contains developer poem');
    assert(wt.score === 50, 'Walkthrough preserves score');
  }

  // 4. Chat Service ("Ask CodeEagle")
  console.log('--- 4. Chat Service Evaluation ---');
  {
    const resExplain = await askCodeEagle({
      code: 'const JWT_SECRET = "12345";',
      filename: 'auth.js',
      issue: { rule: 'SEC-SECRET', severity: 'CRITICAL', title: 'Hardcoded secret' },
      question: 'Why is this secret bad?',
    });
    assert(Boolean(resExplain.reply), 'Chat returns a reply string');
    assert(resExplain.reply.includes('danger') || resExplain.reply.includes('credential') || resExplain.reply.includes('secret'), 'Explains secret risk');

    const resTest = await askCodeEagle({
      code: 'function test() {}',
      filename: 'ActivityFeed.jsx',
      issue: { rule: 'REACT-INDEX-KEY', severity: 'HIGH' },
      question: 'How do I write a unit test for this?',
    });
    assert(resTest.reply.includes('test') || resTest.reply.includes('render'), 'Provides testing guidance');
  }

  // 5. Review Style Mode (Quiet, Chill, Assertive)
  console.log('--- 5. Review Style Mode Tests ---');
  {
    const quietResult = await reviewCode({
      code: 'var a = 1; const secret = "super_secret_token_123456";',
      filename: 'auth.js',
      language: 'javascript',
      reviewStyle: 'quiet',
    });
    assert(quietResult.issues.some((i) => i.rule === 'SEC-SECRET'), 'Quiet mode preserves critical security issues');
    assert(!quietResult.issues.some((i) => i.rule === 'VAR-DECLARATION'), 'Quiet mode filters out non-critical cosmetic warnings');
    assert(quietResult.metadata.reviewStyle === 'quiet', 'Metadata records quiet review style');

    const chillResult = await reviewCode({
      code: 'var a = 1; const secret = "super_secret_token_123456";',
      filename: 'auth.js',
      language: 'javascript',
      reviewStyle: 'chill',
    });
    assert(chillResult.issues.length >= quietResult.issues.length, 'Chill mode includes standard findings');
  }

  console.log(`\n=== Walkthrough & Chat Tests Completed: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();
