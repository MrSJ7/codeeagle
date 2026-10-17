import _traverse from '@babel/traverse';
import { getNodeSource, verifyFixSnippet } from '../utils/sourceUtils.js';
import { RULE_REGISTRY } from './ruleRegistry.js';

const traverse = _traverse.default || _traverse;

function isEffectCall(callee) {
  return (callee.type === 'Identifier' && callee.name === 'useEffect') ||
    (callee.type === 'MemberExpression' && !callee.computed &&
      callee.object.name === 'React' && callee.property.name === 'useEffect');
}

function isInsidePath(path, ancestor) {
  return path === ancestor || Boolean(path.findParent((parent) => parent === ancestor));
}

function isStableHookValue(binding) {
  const declarator = binding?.path;
  if (!declarator?.isVariableDeclarator()) return false;
  const init = declarator.node.init;
  if (!init || !['useState', 'useReducer', 'useRef'].includes(init.callee?.name)) return false;
  if (init.callee.name === 'useRef') return true;
  return declarator.node.id.type === 'ArrayPattern' &&
    declarator.node.id.elements[1] === binding.identifier;
}

function getMissingEffectDependencies(callbackPath, depsArray) {
  const existing = new Set(depsArray.elements
    .filter((element) => element?.type === 'Identifier')
    .map((element) => element.name));
  const missing = new Set();

  callbackPath.traverse({
    Identifier(refPath) {
      if (!refPath.isReferencedIdentifier()) return;
      const name = refPath.node.name;
      const binding = refPath.scope.getBinding(name);
      // Globals, imports and module constants do not change on component renders.
      if (!binding || binding.scope.path.isProgram() || isStableHookValue(binding)) return;
      if (isInsidePath(binding.path, callbackPath)) return;
      if (!existing.has(name)) missing.add(name);
    },
  });
  return [...missing].sort();
}

function isMethodCall(node, method) {
  return node?.type === 'CallExpression' && node.callee?.type === 'MemberExpression' &&
    !node.callee.computed && node.callee.property.name === method;
}

function hasMissingListenerCleanup(callbackPath, code) {
  const subscriptions = [];
  const signature = (node) => {
    const target = getNodeSource(code, node.callee.object);
    const event = getNodeSource(code, node.arguments[0]);
    const handler = getNodeSource(code, node.arguments[1]);
    return `${target}|${event}|${handler}`;
  };
  callbackPath.traverse({
    CallExpression(callPath) {
      if (isMethodCall(callPath.node, 'addEventListener')) subscriptions.push(signature(callPath.node));
    },
  });
  if (subscriptions.length === 0) return false;

  const body = callbackPath.get('body');
  if (!body.isBlockStatement()) return true;
  for (const statement of body.get('body')) {
    if (!statement.isReturnStatement()) continue;
    const cleanup = statement.get('argument');
    if (!cleanup?.isFunction()) continue;
    const removals = new Set();
    cleanup.traverse({
      CallExpression(callPath) {
        if (isMethodCall(callPath.node, 'removeEventListener')) removals.add(signature(callPath.node));
      },
    });
    if (subscriptions.every((entry) => removals.has(entry))) return false;
  }
  return true;
}

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
        description: `Function '${fn.name}' has a cyclomatic complexity of ${fn.complexity} (threshold > 10). The function contains ${fn.complexity - 1} branching decision points (if/else, loops, switch cases, or logical operators). High branch density creates exponential execution paths, making complete unit test coverage difficult and hiding edge-case defects.`,
        recommendation: `Decompose '${fn.name}' into smaller single-responsibility helper functions. Use early returns (guard clauses) to exit early and eliminate branching conditions.`,
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
        description: `Function '${fn.name}' has ${fn.nesting} levels of nested control blocks (threshold > 4). Deep control nesting ("Pyramid of Doom") impairs readability, increases cognitive load, and obscures error handling paths.`,
        recommendation: `Invert condition checks with early guard clauses ('if (!isValid) return;') to flatten nested if/loop/try blocks to the root indentation level.`,
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
        ? `Function '${fn.name}' spans ${fn.lines} lines (threshold > 50). While cyclomatic complexity (${fn.complexity || 1}) and nesting (${fn.nesting || 0}) are moderate, large function length hinders readability and makes code harder to navigate.`
        : `Function '${fn.name}' spans ${fn.lines} lines with elevated cyclomatic complexity (${fn.complexity || 1}) and nesting (${fn.nesting || 0}). Monolithic functions violate the Single Responsibility Principle and tend to mix setup, orchestration, business logic, and error handling into a single block.`;
      const recommendation = `Break down '${fn.name}' into focused, single-responsibility helper functions (e.g., separate setup, validation, execution, and error handling steps).`;

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
        recommendation,
        confidence,
        impactWeight,
        fix: null,
      });
    }
  });

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
      if (isMethodCall(path.node, 'forEach') && path.node.arguments[0]?.async) {
        const line = path.node.loc?.start.line || 1;
        const meta = RULE_REGISTRY['QUAL-ASYNC-FOREACH'];
        addIssue({ id: `${meta.rule}-${line}`, rule: meta.rule, source: 'STATIC',
          severity: meta.defaultSeverity, category: meta.category, ruleClass: meta.ruleClass,
          title: meta.title, line, endLine: path.node.loc?.end.line || line,
          description: meta.description, recommendation: meta.recommendation,
          confidence: meta.confidence, impactWeight: meta.impactWeight, fix: null });
      }

      // React Rules: useEffect
      if (isEffectCall(callee)) {
        const effectCallback = path.node.arguments[0];
        const depsArray = path.node.arguments[1];
        const line = path.node.loc?.start.line || 1;

        if (
          effectCallback &&
          (effectCallback.type === 'ArrowFunctionExpression' || effectCallback.type === 'FunctionExpression')
        ) {
          const callbackBody = effectCallback.body;
          // React Rule: Missing event listener cleanup
          if (hasMissingListenerCleanup(path.get('arguments.0'), code)) {
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

          // Analyze any explicit dependency array using lexical bindings, not a name whitelist.
          if (depsArray?.type === 'ArrayExpression') {
            const missing = getMissingEffectDependencies(path.get('arguments.0'), depsArray);
            if (missing.length > 0) {
              const meta = RULE_REGISTRY['REACT-HOOK-DEPS'];

              addIssue({
                id: `REACT-HOOK-DEPS-${line}`,
                rule: meta.rule,
                source: 'STATIC',
                severity: meta.defaultSeverity,
                category: meta.category,
                ruleClass: meta.ruleClass,
                title: `Missing useEffect ${missing.length === 1 ? 'dependency' : 'dependencies'}: ${missing.join(', ')}`,
                line,
                endLine: depsArray.loc?.end.line || line,
                description: `The effect reads ${missing.map((name) => `'${name}'`).join(', ')} from the enclosing component, but the dependency array omits ${missing.length === 1 ? 'it' : 'them'}. The callback can retain stale values.`,
                recommendation: `Add ${missing.join(', ')} to this effect's dependency array, or restructure the effect if that creates a loop.`,
                confidence: meta.confidence ?? 0.85,
                impactWeight: meta.impactWeight ?? 0.85,
                fix: null,
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
            const mapCall = path.findParent((parent) => {
              if (!parent.isCallExpression()) return false;
              const mapCallee = parent.node.callee;
              const callback = parent.get('arguments.0');
              return mapCallee.type === 'MemberExpression' && !mapCallee.computed &&
                mapCallee.property.name === 'map' && callback?.isFunction() &&
                callback.node.params[1]?.name === expr.name && isInsidePath(path, callback);
            });
            const indexBinding = path.scope.getBinding(expr.name);
            const callback = mapCall?.get('arguments.0');
            if (callback && indexBinding?.path.node === callback.node.params[1]) {
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
      const original = getNodeSource(code, path.node);
      const fix = (path.parentPath.isBlockStatement() || path.parentPath.isProgram()) &&
        original && code.indexOf(original) === code.lastIndexOf(original)
        ? verifyFixSnippet(code, { original, replacement: '' })
        : null;
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
        fix,
      });
    },

    // Quality Rule: Loose equality check (== or !=)
    BinaryExpression(path) {
      if (path.node.operator === '==' || path.node.operator === '!=') {
        // x == null intentionally checks both null and undefined.
        if (path.node.left.type === 'NullLiteral' || path.node.right.type === 'NullLiteral') return;
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
