import _traverse from '@babel/traverse';
import { getLine, getNodeSource, verifyFixSnippet } from '../utils/sourceUtils.js';
import { RULE_REGISTRY } from './ruleRegistry.js';

const traverse = _traverse.default || _traverse;

const SAFE_BUILTIN_IDENTIFIERS = new Set([
  'console',
  'Math',
  'Date',
  'JSON',
  'window',
  'document',
  'fetch',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Promise',
  'Error',
  'undefined',
  'null',
]);

/**
 * Deterministic Code Quality, Complexity, and React Rules
 */
export function analyzeQuality(ast, code = '', functionMetrics = []) {
  const issues = [];
  const reportedKeys = new Set();

  function addIssue(issue) {
    const dedupKey = `${issue.rule}:${issue.line}`;
    if (!reportedKeys.has(dedupKey)) {
      reportedKeys.add(dedupKey);
      issues.push(issue);
    }
  }

  // 1. Function-level Metrics Rules (Complexity, Nesting, Length)
  functionMetrics.forEach((fn) => {
    if (fn.complexity > 10) {
      const meta = RULE_REGISTRY['COMP-HIGH'];
      addIssue({
        id: `COMP-HIGH-${fn.startLine}`,
        rule: meta.rule,
        source: 'STATIC',
        severity: meta.defaultSeverity,
        category: meta.category,
        ruleClass: meta.ruleClass,
        title: `High cyclomatic complexity (${fn.complexity}) in '${fn.name}'`,
        line: fn.startLine,
        endLine: fn.endLine,
        description: `Function '${fn.name}' has a cyclomatic complexity of ${fn.complexity} (threshold > 10). Numerous independent decision paths increase testing difficulty and maintenance overhead.`,
        recommendation: meta.recommendation,
        confidence: meta.confidence ?? 0.95,
        impactWeight: meta.impactWeight ?? 0.70,
        fix: null,
      });
    }

    if (fn.nesting > 4) {
      const meta = RULE_REGISTRY['COMP-NESTING'];
      addIssue({
        id: `COMP-NESTING-${fn.startLine}`,
        rule: meta.rule,
        source: 'STATIC',
        severity: meta.defaultSeverity,
        category: meta.category,
        ruleClass: meta.ruleClass,
        title: `Excessive control-flow nesting (${fn.nesting} levels) in '${fn.name}'`,
        line: fn.startLine,
        endLine: fn.endLine,
        description: `Function '${fn.name}' has ${fn.nesting} levels of nested control blocks (threshold > 4). Deep nesting impairs readability and cognitive tractability.`,
        recommendation: meta.recommendation,
        confidence: meta.confidence ?? 0.95,
        impactWeight: meta.impactWeight ?? 0.70,
        fix: null,
      });
    }

    if (fn.lines > 50) {
      const meta = RULE_REGISTRY['QUAL-LENGTH'];
      const isSimple = (fn.complexity || 1) <= 6 && (fn.nesting || 0) <= 2;
      const confidence = isSimple ? 0.55 : 0.75;
      const impactWeight = isSimple ? 0.15 : 0.30;
      const description = isSimple
        ? `Function '${fn.name}' spans ${fn.lines} lines (threshold > 50). Since cyclomatic complexity (${fn.complexity || 1}) and nesting (${fn.nesting || 0}) are modest, this is an informational maintainability suggestion.`
        : `Function '${fn.name}' spans ${fn.lines} lines with elevated complexity (${fn.complexity || 1}) or nesting (${fn.nesting || 0}). Decomposing into single-responsibility helpers is recommended.`;

      addIssue({
        id: `QUAL-LENGTH-${fn.startLine}`,
        rule: meta.rule,
        source: 'STATIC',
        severity: meta.defaultSeverity,
        category: meta.category,
        ruleClass: meta.ruleClass,
        title: `Function '${fn.name}' spans ${fn.lines} lines`,
        line: fn.startLine,
        endLine: fn.endLine,
        description,
        recommendation: meta.recommendation,
        confidence,
        impactWeight,
        fix: null,
      });
    }
  });

  // Track map callbacks: Map<indexParamName, MapCallExpressionNode>
  const activeMapIndexParams = new Map();

  traverse(ast, {
    // Quality Rule: Empty Catch Block
    CatchClause(path) {
      if (path.node.body && path.node.body.body.length === 0) {
        const line = path.node.loc?.start.line || 1;
        const meta = RULE_REGISTRY['QUAL-EMPTY-CATCH'];
        addIssue({
          id: `QUAL-EMPTY-CATCH-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          ruleClass: meta.ruleClass,
          title: meta.title,
          line,
          endLine: path.node.loc?.end.line || line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: meta.confidence ?? 0.90,
          impactWeight: meta.impactWeight ?? 0.60,
          fix: null,
        });
      }
    },

    // Quality Rule: var keyword usage (Fix is intentionally null: manual refactor recommended)
    VariableDeclaration(path) {
      if (path.node.kind === 'var') {
        const line = path.node.loc?.start.line || 1;
        const meta = RULE_REGISTRY['QUAL-VAR'];
        addIssue({
          id: `QUAL-VAR-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          ruleClass: meta.ruleClass,
          title: meta.title,
          line,
          endLine: line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: meta.confidence ?? 0.50,
          impactWeight: meta.impactWeight ?? 0.10,
          fix: null, // Intentionally null to prevent breaking reassignments
        });
      }
    },

    // Track .map((item, index) => ...)
    CallExpression(path) {
      const callee = path.node.callee;

      // Track .map index parameter strictly within the scope of the callback
      if (
        callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'map'
      ) {
        const arg = path.node.arguments[0];
        if (arg && (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression')) {
          const indexParam = arg.params[1];
          if (indexParam && indexParam.type === 'Identifier') {
            activeMapIndexParams.set(indexParam.name, path.node);
          }
        }
      }

      // React Rules: useEffect
      if (callee.type === 'Identifier' && callee.name === 'useEffect') {
        const effectCallback = path.node.arguments[0];
        const depsArray = path.node.arguments[1];
        const line = path.node.loc?.start.line || 1;

        if (
          effectCallback &&
          (effectCallback.type === 'ArrowFunctionExpression' || effectCallback.type === 'FunctionExpression')
        ) {
          const callbackBody = effectCallback.body;
          const callbackSource = getNodeSource(code, effectCallback);

          // React Rule: Missing event listener cleanup
          if (callbackSource.includes('addEventListener')) {
            // Check if removeEventListener is called anywhere in the effect callback or returned cleanup function
            const hasRemove = callbackSource.includes('removeEventListener');

            if (!hasRemove) {
              const meta = RULE_REGISTRY['PERF-EFFECT-CLEANUP'];
              addIssue({
                id: `PERF-EFFECT-CLEANUP-${line}`,
                rule: meta.rule,
                source: 'STATIC',
                severity: meta.defaultSeverity,
                category: meta.category,
                ruleClass: meta.ruleClass,
                title: meta.title,
                line,
                endLine: path.node.loc?.end.line || line,
                description: meta.description,
                recommendation: meta.recommendation,
                confidence: meta.confidence ?? 0.85,
                impactWeight: meta.impactWeight ?? 0.85,
                fix: null, // Manual refactor required to ensure identical callback references
              });
            }
          }

          // React Rule: Missing dependency in useEffect (empty [] array)
          if (depsArray && depsArray.type === 'ArrayExpression' && depsArray.elements.length === 0) {
            const externalRefs = new Set();

            path.get('arguments.0').traverse({
              Identifier(idPath) {
                const name = idPath.node.name;
                if (SAFE_BUILTIN_IDENTIFIERS.has(name)) return;

                // Ignore property accesses (e.g. obj.name -> ignore 'name')
                if (idPath.parentPath.isMemberExpression() && idPath.parentPath.node.property === idPath.node && !idPath.parentPath.node.computed) {
                  return;
                }

                // Ignore keys in object literals
                if (idPath.parentPath.isObjectProperty() && idPath.parentPath.node.key === idPath.node) {
                  return;
                }

                // If identifier is bound inside the effect callback itself, ignore it
                const callbackScope = path.get('arguments.0').scope;
                if (callbackScope.hasOwnBinding(name)) {
                  return;
                }

                // Only check realistic prop-like external identifiers
                if (['userId', 'productId', 'id', 'user', 'query', 'filter', 'token', 'activeId'].includes(name)) {
                  externalRefs.add(name);
                }
              },
            });

            if (externalRefs.size > 0) {
              const depName = Array.from(externalRefs)[0];
              const meta = RULE_REGISTRY['REACT-HOOK-DEPS'];
              const rawFix = code.includes('}, []);')
                ? { original: '}, []);', replacement: `}, [${depName}]);` }
                : null;

              addIssue({
                id: `REACT-HOOK-DEPS-${line}`,
                rule: meta.rule,
                source: 'STATIC',
                severity: meta.defaultSeverity,
                category: meta.category,
                ruleClass: meta.ruleClass,
                title: `Potential missing dependency '${depName}' in useEffect hook`,
                line,
                endLine: depsArray.loc?.end.line || line,
                description: `The effect callback references '${depName}', but the dependency array is empty []. When '${depName}' changes, the effect will not re-run.`,
                recommendation: `Include '${depName}' in the dependency array [${depName}].`,
                confidence: meta.confidence ?? 0.85,
                impactWeight: meta.impactWeight ?? 0.85,
                fix: verifyFixSnippet(code, rawFix),
              });
            }
          }
        }
      }
    },

    // React Rule: Array index as key in JSX
    JSXAttribute(path) {
      if (path.node.name?.name === 'key') {
        const val = path.node.value;
        if (val && val.type === 'JSXExpressionContainer') {
          const expr = val.expression;
          if (expr && expr.type === 'Identifier') {
            // Must be the actual index parameter from an active enclosing map callback
            if (activeMapIndexParams.has(expr.name)) {
              const line = path.node.loc?.start.line || 1;
              const meta = RULE_REGISTRY['REACT-INDEX-KEY'];

              addIssue({
                id: `REACT-INDEX-KEY-${line}`,
                rule: meta.rule,
                source: 'STATIC',
                severity: meta.defaultSeverity,
                category: meta.category,
                ruleClass: meta.ruleClass,
                title: `Array index '${expr.name}' used as React key prop`,
                line,
                endLine: line,
                description: meta.description,
                recommendation: meta.recommendation,
                confidence: meta.confidence ?? 0.65,
                impactWeight: meta.impactWeight ?? 0.20,
                fix: null, // Safe replacement requires knowledge of unique property
              });
            }
          }
        }
      }
    },

    // Quality Rule: Leftover debugger statement
    DebuggerStatement(path) {
      const line = path.node.loc?.start.line || 1;
      const meta = RULE_REGISTRY['QUAL-DEBUGGER'];
      addIssue({
        id: `QUAL-DEBUGGER-${line}`,
        rule: meta.rule,
        source: 'STATIC',
        severity: meta.defaultSeverity,
        category: meta.category,
        ruleClass: meta.ruleClass,
        title: meta.title,
        line,
        endLine: line,
        description: meta.description,
        recommendation: meta.recommendation,
        confidence: meta.confidence ?? 1.0,
        impactWeight: meta.impactWeight ?? 0.40,
        fix: null,
      });
    },

    // Quality Rule: Loose equality check (== or !=)
    BinaryExpression(path) {
      if (path.node.operator === '==' || path.node.operator === '!=') {
        // Exclude idiomatic null checks if desired, or flag loose comparison
        const line = path.node.loc?.start.line || 1;
        const meta = RULE_REGISTRY['QUAL-EQEQ'];
        const op = path.node.operator;
        const strictOp = op === '==' ? '===' : '!==';

        addIssue({
          id: `QUAL-EQEQ-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          ruleClass: meta.ruleClass,
          title: `Loose equality operator '${op}' should be strict '${strictOp}'`,
          line,
          endLine: line,
          description: meta.description,
          recommendation: `Replace '${op}' with '${strictOp}'.`,
          confidence: meta.confidence ?? 0.70,
          impactWeight: meta.impactWeight ?? 0.20,
          fix: null,
        });
      }
    },

    // Quality Rule: Duplicate keys in object literal
    ObjectExpression(path) {
      const seenKeys = new Set();
      for (const prop of path.node.properties) {
        if (prop.type === 'ObjectProperty' && !prop.computed) {
          const keyName = prop.key.type === 'Identifier' ? prop.key.name : (prop.key.type === 'StringLiteral' ? prop.key.value : null);
          if (keyName) {
            if (seenKeys.has(keyName)) {
              const line = prop.loc?.start.line || 1;
              const meta = RULE_REGISTRY['QUAL-DUPLICATE-KEYS'];
              addIssue({
                id: `QUAL-DUPLICATE-KEYS-${line}`,
                rule: meta.rule,
                source: 'STATIC',
                severity: meta.defaultSeverity,
                category: meta.category,
                ruleClass: meta.ruleClass,
                title: `Duplicate key '${keyName}' in object literal`,
                line,
                endLine: line,
                description: `Property '${keyName}' is defined multiple times in this object literal. Later keys overwrite earlier values.`,
                recommendation: meta.recommendation,
                confidence: meta.confidence ?? 0.95,
                impactWeight: meta.impactWeight ?? 0.80,
                fix: null,
              });
            } else {
              seenKeys.add(keyName);
            }
          }
        }
      }
    },

    // Quality Rule: Unreachable code after terminal statement
    BlockStatement(path) {
      const body = path.node.body;
      let terminatingLine = null;

      for (let i = 0; i < body.length; i++) {
        const stmt = body[i];
        if (terminatingLine !== null) {
          const line = stmt.loc?.start.line || terminatingLine + 1;
          const meta = RULE_REGISTRY['QUAL-UNREACHABLE'];
          addIssue({
            id: `QUAL-UNREACHABLE-${line}`,
            rule: meta.rule,
            source: 'STATIC',
            severity: meta.defaultSeverity,
            category: meta.category,
            ruleClass: meta.ruleClass,
            title: meta.title,
            line,
            endLine: stmt.loc?.end.line || line,
            description: `Statements after return/throw on line ${terminatingLine} are unreachable and will never execute.`,
            recommendation: meta.recommendation,
            confidence: meta.confidence ?? 0.95,
            impactWeight: meta.impactWeight ?? 0.50,
            fix: null,
          });
          break; // Flag once per unreachable sequence
        }

        if (
          stmt.type === 'ReturnStatement' ||
          stmt.type === 'ThrowStatement' ||
          stmt.type === 'BreakStatement' ||
          stmt.type === 'ContinueStatement'
        ) {
          terminatingLine = stmt.loc?.start.line || 1;
        }
      }
    },
  });

  return issues;
}
