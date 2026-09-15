/**
 * Central Rule Registry for CodeLens Static Analysis Engine.
 * Defines rule metadata, categories, severities, and descriptions.
 * 
 * Severity Policy:
 * - CRITICAL: Strong security exposure or dangerous arbitrary code execution.
 * - HIGH: Potential security vulnerability or significant reliability/lifecycle defect.
 * - MEDIUM: Meaningful maintainability, error-containment, or cognitive complexity concern.
 * - LOW: Minor maintainability, style, or performance consideration.
 */

export const RULE_REGISTRY = {
  'SEC-SECRET': {
    rule: 'SEC-SECRET',
    category: 'SECURITY',
    severity: 'CRITICAL',
    defaultSeverity: 'CRITICAL',
    title: 'Hardcoded credential',
    description: 'Detects plaintext secrets, cryptographic keys, and token literals in source code.',
    recommendation: 'Extract sensitive credentials into environment variables or a secret vault.',
  },
  'SEC-SQLI': {
    rule: 'SEC-SQLI',
    category: 'SECURITY',
    severity: 'CRITICAL',
    defaultSeverity: 'CRITICAL',
    title: 'Potential SQL injection',
    description: 'Detects dynamic SQL queries constructed with interpolated or concatenated expressions.',
    recommendation: 'Use parameterized queries with driver-supplied bind variables instead of dynamic query strings.',
  },
  'SEC-EVAL': {
    rule: 'SEC-EVAL',
    category: 'SECURITY',
    severity: 'CRITICAL',
    defaultSeverity: 'CRITICAL',
    title: 'Dangerous use of eval()',
    description: 'Direct invocation of eval() executes arbitrary strings as code.',
    recommendation: 'Refactor to safe JSON parsing or structured data lookups.',
  },
  'SEC-FN-CTOR': {
    rule: 'SEC-FN-CTOR',
    category: 'SECURITY',
    severity: 'HIGH',
    defaultSeverity: 'HIGH',
    title: 'Dynamic code execution via Function constructor',
    description: 'Dynamic function construction possesses execution risks similar to eval().',
    recommendation: 'Use standard lexical functions or declarative dispatch tables.',
  },
  'SEC-DANGEROUS-HTML': {
    rule: 'SEC-DANGEROUS-HTML',
    category: 'SECURITY',
    severity: 'HIGH',
    defaultSeverity: 'HIGH',
    title: 'Potentially unsafe dangerouslySetInnerHTML usage',
    description: 'Direct raw HTML injection bypasses React XSS protections.',
    recommendation: 'Sanitize content with DOMPurify or render standard JSX elements.',
  },
  'COMP-HIGH': {
    rule: 'COMP-HIGH',
    category: 'COMPLEXITY',
    severity: 'HIGH',
    defaultSeverity: 'HIGH',
    title: 'High cyclomatic complexity',
    description: 'Function contains an excessive count of decision points (threshold > 10).',
    recommendation: 'Decompose function into smaller helpers or utilize early returns.',
  },
  'COMP-NESTING': {
    rule: 'COMP-NESTING',
    category: 'COMPLEXITY',
    severity: 'HIGH',
    defaultSeverity: 'HIGH',
    title: 'Excessive control-flow nesting depth',
    description: 'Control flow nesting exceeds the recommended threshold (> 4 levels).',
    recommendation: 'Invert conditional checks with guard clauses to flatten control structures.',
  },
  'QUAL-LENGTH': {
    rule: 'QUAL-LENGTH',
    category: 'QUALITY',
    severity: 'LOW',
    defaultSeverity: 'LOW',
    title: 'Function exceeds recommended line length',
    description: 'Function spans more than 50 source lines.',
    recommendation: 'Refactor into smaller single-responsibility functions.',
  },
  'QUAL-EMPTY-CATCH': {
    rule: 'QUAL-EMPTY-CATCH',
    category: 'QUALITY',
    severity: 'MEDIUM',
    defaultSeverity: 'MEDIUM',
    title: 'Empty catch block suppresses exceptions',
    description: 'Catch block contains no statements, silently hiding failures.',
    recommendation: 'Log the error or provide an explicit fallback recovery path.',
  },
  'QUAL-VAR': {
    rule: 'QUAL-VAR',
    category: 'QUALITY',
    severity: 'LOW',
    defaultSeverity: 'LOW',
    title: "Use of function-scoped 'var' declaration",
    description: "The 'var' keyword introduces function-scoping and hoisting ambiguities.",
    recommendation: "Prefer block-scoped 'const' or 'let' where appropriate.",
  },
  'REACT-INDEX-KEY': {
    rule: 'REACT-INDEX-KEY',
    category: 'QUALITY',
    severity: 'LOW',
    defaultSeverity: 'LOW',
    title: 'Array index used as React key prop',
    description: 'Using map callback index as key can degrade reconciliation on list mutation.',
    recommendation: 'Use a stable, unique item identifier (e.g., item.id).',
  },
  'REACT-HOOK-DEPS': {
    rule: 'REACT-HOOK-DEPS',
    category: 'QUALITY',
    severity: 'HIGH',
    defaultSeverity: 'HIGH',
    title: 'Potential missing dependency in useEffect hook',
    description: 'Callback references an outer prop or variable omitted from dependency array.',
    recommendation: 'Add the referenced variable to the dependency array.',
  },
  'PERF-EFFECT-CLEANUP': {
    rule: 'PERF-EFFECT-CLEANUP',
    category: 'PERFORMANCE',
    severity: 'HIGH',
    defaultSeverity: 'HIGH',
    title: 'Potential missing event-listener cleanup in useEffect',
    description: 'Subscribing to DOM/window events without unregistering on unmount can leak memory.',
    recommendation: 'Return a cleanup function from useEffect that invokes removeEventListener.',
  },
};

/**
 * Returns clean array of all supported rules for API exposition.
 */
export function getRegisteredRules() {
  return Object.values(RULE_REGISTRY).map((r) => ({
    rule: r.rule,
    category: r.category,
    severity: r.severity,
    title: r.title,
    description: r.description,
    recommendation: r.recommendation,
  }));
}
