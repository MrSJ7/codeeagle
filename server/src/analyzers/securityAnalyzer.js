import _traverse from '@babel/traverse';
import { getNodeSource } from '../utils/sourceUtils.js';
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
const SQL_SINKS = new Set(['query', 'execute', 'exec', 'raw', '$queryRawUnsafe']);

function memberName(node) {
  if (node?.type !== 'MemberExpression') return null;
  return node.computed ? node.property?.value : node.property?.name;
}

function isNumericSqlValue(path, seen = new Set()) {
  if (path.isNumericLiteral() || path.isBooleanLiteral()) return true;
  if (path.isUnaryExpression({ operator: '+' }) || path.isUnaryExpression({ operator: '-' })) {
    return isNumericSqlValue(path.get('argument'), seen);
  }
  if (path.isCallExpression() && ['Number', 'parseInt', 'parseFloat'].includes(path.node.callee?.name)) {
    return true;
  }
  if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (!binding?.constant || !binding.path.isVariableDeclarator() || seen.has(binding)) return false;
    seen.add(binding);
    const init = binding.path.get('init');
    return Boolean(init?.node && isNumericSqlValue(init, seen));
  }
  return false;
}

function sqlParts(path, seen = new Set()) {
  if (!path?.node) return null;
  if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (!binding?.constant || !binding.path.isVariableDeclarator() || seen.has(binding)) return null;
    seen.add(binding);
    return sqlParts(binding.path.get('init'), seen);
  }
  if (path.isStringLiteral()) return { sourcePath: path, text: path.node.value, values: [] };
  if (path.isTemplateLiteral()) {
    return {
      sourcePath: path,
      text: path.node.quasis.map((part) => part.value.cooked || part.value.raw).join(' '),
      values: path.get('expressions'),
    };
  }
  if (path.isBinaryExpression({ operator: '+' })) {
    const left = sqlParts(path.get('left'), new Set(seen));
    const right = sqlParts(path.get('right'), new Set(seen));
    return {
      sourcePath: path,
      text: [left?.text, right?.text].filter(Boolean).join(' '),
      values: [...(left?.values || (left ? [] : [path.get('left')])), ...(right?.values || (right ? [] : [path.get('right')]))],
    };
  }
  return null;
}

function isSafeHtmlValue(path, seen = new Set()) {
  if (!path?.node) return false;
  if (path.isStringLiteral() || (path.isTemplateLiteral() && path.node.expressions.length === 0)) return true;
  if (path.isCallExpression()) {
    const callee = path.node.callee;
    return (memberName(callee) === 'sanitize' && callee.object?.name === 'DOMPurify') ||
      callee.name === 'sanitizeHtml';
  }
  if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (!binding?.constant || !binding.path.isVariableDeclarator() || seen.has(binding)) return false;
    seen.add(binding);
    return isSafeHtmlValue(binding.path.get('init'), seen);
  }
  return false;
}

function isRequestDerived(path, code, seen = new Set()) {
  if (!path?.node) return false;
  const source = getNodeSource(code, path.node) || '';
  if (/\b(req|request)\.(body|query|params|headers)\b/.test(source)) return true;
  if (path.isMemberExpression()) return isRequestDerived(path.get('object'), code, seen);
  if (path.isTemplateLiteral()) return path.get('expressions').some((part) => isRequestDerived(part, code, seen));
  if (path.isBinaryExpression()) return isRequestDerived(path.get('left'), code, seen) || isRequestDerived(path.get('right'), code, seen);
  if (!path.isIdentifier()) return false;
  const binding = path.scope.getBinding(path.node.name);
  if (!binding || seen.has(binding)) return false;
  seen.add(binding);
  const declaration = binding?.path?.isVariableDeclarator()
    ? binding.path
    : binding?.path?.findParent((parent) => parent.isVariableDeclarator());
  const bindingSource = declaration ? getNodeSource(code, declaration.node) : '';
  if (/\b(req|request)\.(body|query|params|headers)\b/.test(bindingSource || '')) return true;
  return Boolean(declaration?.get('init')?.node && isRequestDerived(declaration.get('init'), code, seen));
}

function postgresClientNames(ast) {
  const constructors = new Set();
  const clients = new Set();
  for (const statement of ast.program.body) {
    if (statement.type !== 'ImportDeclaration' || statement.source.value !== 'pg') continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === 'ImportSpecifier' && ['Pool', 'Client'].includes(specifier.imported.name)) {
        constructors.add(specifier.local.name);
      }
    }
  }
  if (constructors.size === 0) return clients;
  traverse(ast, { VariableDeclarator(path) {
    if (path.node.id.type === 'Identifier' && path.node.init?.type === 'NewExpression' &&
        constructors.has(path.node.init.callee.name)) clients.add(path.node.id.name);
  } });
  return clients;
}

function postgresTemplateFix(callPath, code, pgClients) {
  const receiver = callPath.node.callee?.object?.name;
  const query = callPath.get('arguments.0');
  if (!pgClients.has(receiver) || !query.isTemplateLiteral() || callPath.node.arguments.length !== 1) return null;
  const expressions = query.get('expressions');
  if (expressions.length === 0) return null;
  const quasis = query.node.quasis.map((part) => part.value.cooked);
  if (quasis.some((part) => typeof part !== 'string')) return null;
  const values = expressions.map((part) => getNodeSource(code, part.node));
  if (values.some((value) => !value)) return null;
  let sql = quasis[0];
  for (let index = 0; index < expressions.length; index++) {
    let next = quasis[index + 1];
    // Only rewrite interpolation used as a SQL value, never identifiers or clauses.
    if (!/[=(,]\s*'?$/u.test(sql)) return null;
    if (sql.endsWith("'") && next.startsWith("'")) {
      sql = sql.slice(0, -1);
      next = next.slice(1);
    } else if (sql.endsWith("'") || next.startsWith("'")) {
      return null;
    }
    sql += `$${index + 1}` + next;
  }
  const original = getNodeSource(code, callPath.node);
  const replacement = `${getNodeSource(code, callPath.node.callee)}(${JSON.stringify(sql)}, [${values.join(', ')}])`;
  return { original, replacement };
}

/**
 * Deterministic Security Static Analysis Rules
 */
export function analyzeSecurity(ast, code = '') {
  const issues = [];
  const reportedKeys = new Set();
  const pgClients = postgresClientNames(ast);

  function addIssue(issue) {
    const dedupKey = `${issue.rule}:${issue.line}`;
    if (!reportedKeys.has(dedupKey)) {
      reportedKeys.add(dedupKey);
      issues.push(issue);
    }
  }

  function inspectSqlCall(path) {
    if (!SQL_SINKS.has(memberName(path.node.callee))) return;
    const queryArg = path.get('arguments.0');
    const parts = sqlParts(queryArg);
    if (!parts || !SQL_KEYWORDS_REGEX.test(parts.text)) return;
    const unsafeValues = parts.values.filter((value) => !isNumericSqlValue(value));
    if (unsafeValues.length === 0) return;

    const line = parts.sourcePath.node.loc?.start.line || path.node.loc?.start.line || 1;
    const endLine = path.node.loc?.end.line || line;
    const meta = RULE_REGISTRY['SEC-SQLI'];
    const sink = getNodeSource(code, path.node.callee) || 'query()';
    const requestInput = unsafeValues.some((value) => isRequestDerived(value, code));
    const valueNames = unsafeValues.map((value) => getNodeSource(code, value.node) || 'value').slice(0, 3);
    addIssue({
      id: `SEC-SQLI-${line}`,
      rule: meta.rule,
      source: 'STATIC',
      severity: requestInput ? 'CRITICAL' : 'HIGH',
      category: meta.category,
      ruleClass: meta.ruleClass,
      title: 'Dynamic values reach a SQL query',
      line,
      endLine,
      description: `${valueNames.join(', ')} ${unsafeValues.length === 1 ? 'is' : 'are'} interpolated into SQL text passed to ${sink}. ${requestInput ? 'The value comes from request input and can change query structure.' : 'If a value is untrusted, it can change query structure.'}`,
      recommendation: 'Pass the SQL text and values separately using bind parameters supported by this database driver. Do not build query text with interpolation or concatenation.',
      confidence: requestInput ? 0.95 : 0.82,
      impactWeight: meta.impactWeight ?? 1.0,
      fix: postgresTemplateFix(path, code, pgClients),
    });
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
          const meta = RULE_REGISTRY['SEC-SECRET'];
          addIssue({
            id: `SEC-SECRET-${line}`,
            rule: meta.rule,
            source: 'STATIC',
            severity: meta.defaultSeverity,
            category: meta.category,
            ruleClass: meta.ruleClass,
            title: `Hardcoded credential in '${idName}'`,
            line,
            endLine,
            description: `The variable '${idName}' is assigned a plaintext secret literal. Hardcoded credentials can be leaked through source control history or build artifacts.`,
            recommendation: `Remove '${idName}' from source and rotate the exposed credential. Load the replacement from a server-side secret store; do not bundle it into client code.`,
            confidence: meta.confidence ?? 0.98,
            impactWeight: meta.impactWeight ?? 1.0,
            fix: null,
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
            ruleClass: meta.ruleClass,
            title: `Exposed secret token format (${tokenRule.name})`,
            line,
            endLine: line,
            description: `A string literal matching the format of a ${tokenRule.name} was detected directly in source code.`,
            recommendation: 'Remove the sensitive token from source code and load it dynamically from an environment variable or secret manager.',
            confidence: meta.confidence ?? 1.0,
            impactWeight: meta.impactWeight ?? 1.0,
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
      inspectSqlCall(path);

      if (callee.type === 'Identifier' && callee.name === 'eval') {
        const meta = RULE_REGISTRY['SEC-EVAL'];
        addIssue({
          id: `SEC-EVAL-${line}`,
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
          impactWeight: meta.impactWeight ?? 1.0,
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
          ruleClass: meta.ruleClass,
          title: meta.title,
          line,
          endLine: line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: meta.confidence ?? 0.95,
          impactWeight: meta.impactWeight ?? 0.85,
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
          ruleClass: meta.ruleClass,
          title: meta.title,
          line,
          endLine: line,
          description: meta.description,
          recommendation: meta.recommendation,
          confidence: meta.confidence ?? 0.95,
          impactWeight: meta.impactWeight ?? 0.85,
          fix: null,
        });
      }
    },

    // Rule: SEC-DANGEROUS-HTML
    JSXAttribute(path) {
      if (path.node.name?.name === 'dangerouslySetInnerHTML') {
        const value = path.get('value');
        const expression = value.isJSXExpressionContainer() ? value.get('expression') : null;
        const htmlProperty = expression?.isObjectExpression()
          ? expression.get('properties').find((prop) => prop.isObjectProperty() &&
              (prop.node.key?.name === '__html' || prop.node.key?.value === '__html'))
          : null;
        if (htmlProperty && isSafeHtmlValue(htmlProperty.get('value'))) return;
        const line = path.node.loc?.start.line || 1;
        const meta = RULE_REGISTRY['SEC-DANGEROUS-HTML'];
        addIssue({
          id: `SEC-DANGEROUS-HTML-${line}`,
          rule: meta.rule,
          source: 'STATIC',
          severity: meta.defaultSeverity,
          category: meta.category,
          ruleClass: meta.ruleClass,
          title: meta.title,
          line,
          endLine: line,
          description: 'Raw HTML is passed to dangerouslySetInnerHTML without a visible sanitization step. If the value contains user content, scripts or unsafe markup can reach the browser.',
          recommendation: meta.recommendation,
          confidence: meta.confidence ?? 0.90,
          impactWeight: meta.impactWeight ?? 0.85,
          fix: null,
        });
      }
    },

  });

  return issues;
}
