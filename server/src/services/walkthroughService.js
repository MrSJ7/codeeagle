/**
/**
 * Walkthrough & PR Artifacts Generator for CodeEagle.
 * Reverse-engineered from CodeRabbit's signature change management pipeline:
 * 1. Executive Summary & Change Assessment
 * 2. Visual Mermaid Sequence / Flow Diagram
 * 3. Semantic File Cohorts (categorized by architectural responsibility)
 * 4. Whimsical Developer Poem / Haiku
 */

/**
 * Infers an execution sequence diagram in Mermaid format based on code patterns and issues.
 * @param {object} params
 * @returns {string} Mermaid sequence diagram
 */
export function generateMermaidDiagram({ code = '', filename = '', issues = [] }) {
  const isAuth = filename.toLowerCase().includes('auth') || code.includes('jwt') || code.includes('login') || code.includes('password');
  const isReact = filename.endsWith('.jsx') || filename.endsWith('.tsx') || code.includes('useEffect') || code.includes('useState');
  const isOrderOrPay = filename.toLowerCase().includes('fee') || filename.toLowerCase().includes('shipping') || filename.toLowerCase().includes('order');

  if (isAuth) {
    const hasSecretIssue = issues.some((i) => i.rule === 'SEC-SECRET');
    return `sequenceDiagram
  autonumber
  actor Client as Web / Mobile Client
  participant Gateway as API Gateway / Route
  participant Auth as Auth Controller (${filename})
  participant Vault as Env / Key Vault
  participant DB as User Database

  Client->>Gateway: POST /auth/login (credentials)
  Gateway->>Auth: validateCredentials(user)
  Auth->>DB: queryUserByEmail(email)
  DB-->>Auth: userRecord + passwordHash
  ${hasSecretIssue 
    ? 'Note over Auth: ⚠️ Risk: Hardcoded secret used for signature'
    : 'Auth->>Vault: fetch JWT_SECRET'}
  Auth->>Auth: jwt.sign(payload, SECRET)
  Auth-->>Gateway: HTTP 200 { token }
  Gateway-->>Client: Bearer Token`;
  }

  if (isReact) {
    const hasHookIssue = issues.some((i) => i.rule === 'REACT-HOOK-DEPS' || i.rule === 'PERF-EFFECT-CLEANUP');
    return `sequenceDiagram
  autonumber
  actor User as End User
  participant UI as React Component (${filename})
  participant State as React State / Hooks
  participant API as Backend Service

  User->>UI: Trigger Action / Mount
  UI->>State: useState / useReducer
  UI->>API: useEffect fetch data
  API-->>State: Receive Async Response
  ${hasHookIssue ? 'Note over State,UI: ⚠️ Warning: Missing deps or missing event cleanup' : 'State-->>UI: Re-render DOM'}
  UI-->>User: Visual Feed Rendered`;
  }

  if (isOrderOrPay) {
    return `sequenceDiagram
  autonumber
  actor Customer as Checkout Flow
  participant Calculator as ${filename}
  participant Rules as Tier / Rule Engine
  participant Invoice as Order Summary

  Customer->>Calculator: calculateTotal(items, address)
  Calculator->>Rules: evaluateDiscounts & baseRates
  Rules-->>Calculator: applicable multipliers
  Calculator->>Calculator: computeTaxAndShipping()
  Calculator-->>Invoice: return { total, feeBreakdown }
  Invoice-->>Customer: Display Final Total`;
  }

  // Generic clean software pipeline diagram
  return `sequenceDiagram
  autonumber
  participant Caller as Calling Module
  participant Handler as ${filename}
  participant Validator as Input Validator
  participant Core as Core Engine

  Caller->>Handler: invokeOperation(payload)
  Handler->>Validator: validateSchema(payload)
  Validator-->>Handler: validation status
  Handler->>Core: executeBusinessLogic()
  Core-->>Handler: computed output
  Handler-->>Caller: Final Response`;
}

/**
 * Generates a whimsical 4-line developer poem / haiku summarizing the review.
 * @param {object} params
 * @returns {string} 4-line developer poem
 */
export function generateDeveloperPoem({ score = 100, issues = [], filename = '' }) {
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = issues.filter((i) => i.severity === 'HIGH').length;

  if (criticalCount > 0) {
    return `An eagle's eye spotted a critical snare,
Hidden credentials laid dangerously bare.
One verified fix and the secrets take flight,
Now shipping to prod with your perimeter tight!`;
  }

  if (highCount > 0) {
    return `A bug in the logic was ready to bite,
With branches convoluted far into the night.
Refactored and clean with our eagle in tow,
Your code now can soar with a high-speed flow!`;
  }

  if (score >= 90) {
    return `The functions are sleek and the syntax is sound,
No hazardous secrets or memory bounds.
The pull request shines in the developer's view,
Approved by CodeEagle for merging by you!`;
  }

  return `Lines of code dance in the terminal breeze,
Patched by our eagle with effortless ease.
From linting to logic and AST scan,
Production-grade quality right in your plan.`;
}

/**
 * Builds the complete semantic walkthrough structure.
 * @param {object} params
 * @returns {object} Walkthrough structure
 */
export function buildReviewWalkthrough({
  code = '',
  filename = 'source.js',
  language = 'javascript',
  issues = [],
  score = 100,
  metrics = {},
  summary = {},
  reviewStyle = 'chill',
}) {
  const normScore = Math.round(score);
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = issues.filter((i) => i.severity === 'HIGH').length;

  let riskLevel = 'LOW';
  let verdict = 'Ready to ship';

  if (criticalCount > 0) {
    riskLevel = 'CRITICAL';
    verdict = 'Blocked by critical vulnerabilities';
  } else if (highCount > 0 || normScore < 60) {
    riskLevel = 'HIGH';
    verdict = 'Requires immediate attention';
  } else if (normScore < 80) {
    riskLevel = 'MEDIUM';
    verdict = 'Minor code quality improvements recommended';
  }

  // Key architectural changes & observations
  const keyObservations = [];
  if (issues.some((i) => i.category === 'SECURITY')) {
    keyObservations.push('Security audit flags sensitive authentication or data validation hotspots.');
  }
  if (issues.some((i) => i.category === 'COMPLEXITY')) {
    keyObservations.push('Cyclomatic complexity exceeds threshold; recommended decomposition into guard clauses.');
  }
  if (issues.some((i) => i.category === 'PERFORMANCE' || i.rule.includes('HOOK'))) {
    keyObservations.push('Lifecycle side-effects detected; resource cleanup or dependency optimization advised.');
  }
  if (keyObservations.length === 0) {
    keyObservations.push('Clean execution paths and balanced modular structure detected.');
  }

  // Cohort assignment
  const fileRole = filename.endsWith('.jsx') || filename.endsWith('.tsx')
    ? 'Frontend & UI'
    : filename.toLowerCase().includes('auth') || filename.toLowerCase().includes('user')
    ? 'Authentication & Security'
    : filename.toLowerCase().includes('test')
    ? 'Test Suite'
    : 'Core Business Logic';

  const executiveSummary = issues.length === 0
    ? `The file \`${filename}\` passed static AST checks with zero regressions. All functions operate within optimal cyclomatic limits.`
    : `CodeEagle analyzed \`${filename}\` (${metrics.lines || code.split('\n').length} lines). Identified ${issues.length} actionable item${issues.length === 1 ? '' : 's'} across ${Array.from(new Set(issues.map((i) => i.category))).join(', ')}.`;

  const mermaid = generateMermaidDiagram({ code, filename, issues });
  const poem = generateDeveloperPoem({ score: normScore, issues, filename });

  return {
    executiveSummary,
    riskLevel,
    verdict,
    reviewStyle,
    score: normScore,
    keyObservations,
    fileRole,
    diagram: mermaid,
    poem,
    totalFindings: issues.length,
    criticalCount,
    highCount,
  };
}
