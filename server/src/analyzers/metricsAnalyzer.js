import _traverse from '@babel/traverse';
import { countLines } from '../utils/sourceUtils.js';

const traverse = _traverse.default || _traverse;

/**
 * Calculates deterministic AST code metrics:
 * - Lines: total lines in source text
 * - Functions: count of functions / methods
 * - Branches: decision points (if, loops, switch-cases, ternaries, logical operators)
 * - Cyclomatic Complexity: 1 + decision points (McCabe)
 * - Max Nesting: deepest nested control flow structure
 * - Function Metrics: isolated complexity and nesting for each function scope
 */
export function analyzeMetrics(ast, code = '') {
  const totalLines = countLines(code);

  let functionsCount = 0;
  let totalBranches = 0;
  let globalMaxNesting = 0;
  let globalCurrentNesting = 0;

  const functionMetrics = [];
  const functionStack = [];

  // Structures that deepen control-flow nesting
  const isControlFlow = (path) =>
    path.isIfStatement() ||
    path.isForStatement() ||
    path.isForInStatement() ||
    path.isForOfStatement() ||
    path.isWhileStatement() ||
    path.isDoWhileStatement() ||
    path.isSwitchStatement() ||
    path.isTryStatement();

  // Explicit decision points for Cyclomatic Complexity:
  // 1. Conditionals (if, ternary)
  // 2. Iteration (for, for-in, for-of, while, do-while)
  // 3. Switch branches (cases with test, excluding default)
  // 4. Short-circuit logical operators (&&, ||, ??)
  const isBranchPoint = (path) =>
    path.isIfStatement() ||
    path.isForStatement() ||
    path.isForInStatement() ||
    path.isForOfStatement() ||
    path.isWhileStatement() ||
    path.isDoWhileStatement() ||
    path.isConditionalExpression() ||
    path.isLogicalExpression() ||
    (path.isSwitchCase() && path.node.test !== null);

  const isFunctionNode = (path) =>
    path.isFunctionDeclaration() ||
    path.isFunctionExpression() ||
    path.isArrowFunctionExpression() ||
    path.isObjectMethod() ||
    path.isClassMethod();

  traverse(ast, {
    enter(path) {
      // 1. Function Scope Entry
      if (isFunctionNode(path)) {
        functionsCount++;
        const startLine = path.node.loc?.start.line || 1;
        const endLine = path.node.loc?.end.line || startLine;
        let name = 'anonymous';

        if (path.node.id?.name) {
          name = path.node.id.name;
        } else if (path.node.key?.name) {
          name = path.node.key.name;
        } else if (path.parentPath?.isVariableDeclarator() && path.parentPath.node.id?.name) {
          name = path.parentPath.node.id.name;
        } else if (path.parentPath?.isObjectProperty() && path.parentPath.node.key?.name) {
          name = path.parentPath.node.key.name;
        }

        functionStack.push({
          name,
          startLine,
          endLine,
          branches: 0,
          complexity: 1,
          currentNesting: 0,
          maxNesting: 0,
        });
      }

      // 2. Control Flow Nesting (Tracked separately for file and current function)
      if (isControlFlow(path)) {
        globalCurrentNesting++;
        if (globalCurrentNesting > globalMaxNesting) {
          globalMaxNesting = globalCurrentNesting;
        }

        if (functionStack.length > 0) {
          const currentFn = functionStack[functionStack.length - 1];
          currentFn.currentNesting++;
          if (currentFn.currentNesting > currentFn.maxNesting) {
            currentFn.maxNesting = currentFn.currentNesting;
          }
        }
      }

      // 3. Branching Points (Branches inside nested functions isolate to innermost scope)
      if (isBranchPoint(path)) {
        totalBranches++;
        if (functionStack.length > 0) {
          const currentFn = functionStack[functionStack.length - 1];
          currentFn.branches++;
          currentFn.complexity = 1 + currentFn.branches;
        }
      }
    },

    exit(path) {
      // Unwind control flow nesting cleanly on exit so siblings never accumulate
      if (isControlFlow(path)) {
        globalCurrentNesting = Math.max(0, globalCurrentNesting - 1);
        if (functionStack.length > 0) {
          const currentFn = functionStack[functionStack.length - 1];
          currentFn.currentNesting = Math.max(0, currentFn.currentNesting - 1);
        }
      }

      // Unwind function scope and record isolated function metrics
      if (isFunctionNode(path)) {
        const completedFn = functionStack.pop();
        if (completedFn) {
          functionMetrics.push({
            name: completedFn.name,
            startLine: completedFn.startLine,
            endLine: completedFn.endLine,
            lines: completedFn.endLine - completedFn.startLine + 1,
            branches: completedFn.branches,
            complexity: completedFn.complexity,
            nesting: completedFn.maxNesting,
          });
        }
      }
    },
  });

  return {
    metrics: {
      lines: totalLines,
      functions: functionsCount,
      branches: totalBranches,
      complexity: 1 + totalBranches,
      maxNesting: globalMaxNesting,
    },
    functionMetrics,
  };
}
