import _traverse from '@babel/traverse';
import { getLine, getNodeSource, verifyFixSnippet } from '../utils/sourceUtils.js';
import { RULE_REGISTRY } from './ruleRegistry.js';

const traverse = _traverse.default || _traverse;

const SUSPICIOUS_SECRET_ID = /^(?=.*(secret|api_key|apikey|private_key|auth_token|jwt))(?!.*(label|name|title|placeholder|type|class|path|url|id)).*$/i;

const COMMON_BENIGN_VALUES = new Set([
  'development',
  'test',
  'testing',
  'production',
  'staging',
  'default',
  'localhost',
  'password',
  'admin',
  'codelens',
  'secret',
  'none',
  'null',
  'undefined',
  'example',
  'changeme',
]);

const KNOWN_TOKEN_PATTERNS = [
  { name: 'Google Cloud / Gemini API key', regex: /AIzaSy[0-9A-Za-z_-]{33}/ },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'JWT Token String', regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+/ },
  { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/ },
];

const SQL_KEYWORDS_REGEX = /\b(SELECT\s+.+\s+FROM|INSERT\s+INTO\s+.+|UPDATE\s+.+\s+SET|DELETE\s+FROM\s+.+|WHERE\s+.+=)\b/i;

/**
 * Deterministic Security Static Analysis Rules
 */
export function analyzeSecurity(ast, code = '') {
  const issues = [];
  const reportedKeys = new Set();

  function addIssue(issue) {
    const dedupKey = `${issue.rule}:${issue.line}`;
    if (!reportedKeys.has(dedupKey)) {
      reportedKeys.add(dedupKey);
      issues.push(issue);
    }
  }

  traverse(ast, {
    // Rule: SEC-SECRET (Suspicious variable identifier + secret-like string value)
    VariableDeclarator(path) {
      const idName = path.node.id?.name;
      const init = path.node.init;

      if (idName && init && init.type === 'StringLiteral') {
        const val = init.value.trim();
        const lowerVal = val.toLowerCase();

        // Must be suspicious identifier, at least 8 chars, and not in benign list
        if (
          SUSPICIOUS_SECRET_ID.test(idName) &&
          val.length >= 8 &&
          !COMMON_BENIGN_VALUES.has(lowerVal)
        ) {
          const line = path.node.loc?.start.line || 1;
          const endLine = path.node.loc?.end.line || line;
          const originalLine = getLine(code, line);

          const rawFix = originalLine.includes(`'${val}'`)
            ? { original: originalLine, replacement: originalLine.replace(`'${val}'`, `process.env.${idName}`) }
            : originalLine.includes(`"${val}"`)
            ? { original: originalLine, replacement: originalLine.replace(`"${val}"`, `process.env.${idName}`) }
            : null;

          const meta = RULE_REGISTRY['SEC-SECRET'];
          addIssue({
            id: `SEC-SECRET-${line}`,
            rule: meta.rule,
            source: 'STATIC',
            severity: meta.defaultSeverity,
            category: meta.category,
            title: `Hardcoded credential in '${idName}'`,
            line,
            endLine,
            description: `The variable '${idName}' is assigned a plaintext secret literal. Hardcoded credentials can be leaked through source control history or build artifacts.`,
            recommendation: `Extract '${idName}' into an environment variable loaded via process.env.${idName}.`,
            confidence: 1.0,
            fix: verifyFixSnippet(code, rawFix),
          });
        }
      }
    },

    // Rule: SEC-SECRET (High-confidence known token regex literals)
    StringLiteral(path) {
      const val = path.node.value;
      if (!val || val.length < 16) return;

      for (const tokenRule of KNOWN_TOKEN_PATTERNS) {
        if (tokenRule.regex.test(val)) {
          const line = path.node.loc?.start.line || 1;
          const meta = RULE_REGISTRY['SEC-SECRET'];

          addIssue({
            id: `SEC-SECRET-${line}`,
            rule: meta.rule,
            source: 'STATIC',
            severity: meta.defaultSeverity,
            category: meta.category,
            title: `Exposed secret token format (${tokenRule.name})`,
            line,
            endLine: line,
            description: `A string literal matching the format of a ${tokenRule.name} was detected directly in source code.`,
            recommendation: 'Remove the sensitive token from source code and load it dynamically from an environment variable or secret manager.',
            confidence: 1.0,
            fix: null,
          });
          break;
        }
      }
    },

    // Rule: SEC-EVAL & SEC-FN-CTOR
    CallExpression(path) {
      const callee = path.node.callee;
      const line = path.node.loc?.start.line || 1;

      if (callee.type === 'Identifier' && callee.name === 'eval') {
        const meta = RULE_REGISTRY['SEC-EVAL'];
        addIssue({
          id: `SEC-EVAL-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          title: meta.title,
          line,
          endLine: line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: 1.0,
          fix: null,
        });
      }

      if (callee.type === 'Identifier' && callee.name === 'Function') {
        const meta = RULE_REGISTRY['SEC-FN-CTOR'];
        addIssue({
          id: `SEC-FN-CTOR-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          title: meta.title,
          line,
          endLine: line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: 1.0,
          fix: null,
        });
      }
    },

    NewExpression(path) {
      const callee = path.node.callee;
      if (callee.type === 'Identifier' && callee.name === 'Function') {
        const line = path.node.loc?.start.line || 1;
        const meta = RULE_REGISTRY['SEC-FN-CTOR'];
        addIssue({
          id: `SEC-FN-CTOR-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          title: meta.title,
          line,
          endLine: line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: 1.0,
          fix: null,
        });
      }
    },

    // Rule: SEC-DANGEROUS-HTML
    JSXAttribute(path) {
      if (path.node.name?.name === 'dangerouslySetInnerHTML') {
        const line = path.node.loc?.start.line || 1;
        const meta = RULE_REGISTRY['SEC-DANGEROUS-HTML'];
        addIssue({
          id: `SEC-DANGEROUS-HTML-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          title: meta.title,
          line,
          endLine: line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: 0.9,
          fix: null,
        });
      }
    },

    // Rule: SEC-SQLI (Template literals with dynamic expressions)
    TemplateLiteral(path) {
      const quasis = path.node.quasis.map((q) => q.value.raw).join(' ');
      const hasExpressions = path.node.expressions.length > 0;

      if (hasExpressions && SQL_KEYWORDS_REGEX.test(quasis)) {
        const line = path.node.loc?.start.line || 1;
        const endLine = path.node.loc?.end.line || line;
        const meta = RULE_REGISTRY['SEC-SQLI'];

        addIssue({
          id: `SEC-SQLI-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          title: 'Potential SQL injection via dynamic template string',
          line,
          endLine,
          description: 'SQL keywords were detected inside a dynamic template string containing interpolated expressions. If interpolated variables contain unvalidated user input, this enables SQL injection.',
          recommendation: meta.recommendation,
          confidence: 0.85,
          fix: null,
        });
      }
    },

    // Rule: SEC-SQLI (String concatenation with dynamic expressions)
    BinaryExpression(path) {
      if (path.node.operator === '+') {
        const left = path.node.left;
        const right = path.node.right;

        const leftIsSql = left.type === 'StringLiteral' && SQL_KEYWORDS_REGEX.test(left.value);
        const rightIsDynamic = right.type === 'Identifier' || right.type === 'MemberExpression' || right.type === 'CallExpression';

        if (leftIsSql && rightIsDynamic) {
          const line = path.node.loc?.start.line || 1;
          const meta = RULE_REGISTRY['SEC-SQLI'];

          addIssue({
            id: `SEC-SQLI-${line}`,
            rule: meta.rule,
            source: 'STATIC',
            severity: meta.defaultSeverity,
            category: meta.category,
            title: 'Potential SQL injection via string concatenation',
            line,
            endLine: line,
            description: 'SQL query string is concatenated dynamically with an expression. If the expression contains unvalidated user input, this enables SQL injection.',
            recommendation: meta.recommendation,
            confidence: 0.85,
            fix: null,
          });
        }
      }
    },
  });

  return issues;
}
