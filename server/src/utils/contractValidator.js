/**
 * Canonical Review Response Schema Validator.
 * Used in tests and development guards to verify that /api/review responses
 * strictly adhere to the contract.
 */
import { RULE_REGISTRY } from '../analyzers/ruleRegistry.js';

const VALID_SEVERITIES = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
const VALID_CATEGORIES = new Set(['SECURITY', 'QUALITY', 'PERFORMANCE', 'COMPLEXITY']);
const SEVERITY_ORDER = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

/**
 * Validates review output against the canonical CodeLens review contract.
 * @param {object} res The review response object.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateReviewContract(res) {
  const errors = [];

  if (!res || typeof res !== 'object' || Array.isArray(res)) {
    return { valid: false, errors: ['Response must be a non-null object'] };
  }

  // 1. Required top-level fields
  const requiredTopKeys = ['score', 'breakdown', 'metrics', 'issues', 'summary', 'metadata'];
  for (const k of requiredTopKeys) {
    if (!(k in res)) {
      errors.push(`Missing required top-level key: "${k}"`);
    }
  }

  // 2. Score range
  if (typeof res.score !== 'number' || !Number.isInteger(res.score) || res.score < 0 || res.score > 100) {
    errors.push(`Score must be an integer between 0 and 100, got: ${res.score}`);
  }

  // 3. Breakdown ranges
  if (!res.breakdown || typeof res.breakdown !== 'object') {
    errors.push('Breakdown must be an object');
  } else {
    const requiredCats = ['security', 'quality', 'performance', 'complexity'];
    for (const cat of requiredCats) {
      const val = res.breakdown[cat];
      if (typeof val !== 'number' || val < 0 || val > 100) {
        errors.push(`Breakdown "${cat}" must be a number between 0 and 100, got: ${val}`);
      }
    }
  }

  // 4. Metrics types
  if (!res.metrics || typeof res.metrics !== 'object') {
    errors.push('Metrics must be an object');
  } else {
    const requiredMetrics = ['lines', 'functions', 'branches', 'complexity', 'maxNesting'];
    for (const m of requiredMetrics) {
      const val = res.metrics[m];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < 0) {
        errors.push(`Metric "${m}" must be a non-negative integer, got: ${val}`);
      }
    }
    if ('loc' in res.metrics) errors.push('Metric "loc" is deprecated; use "lines"');
    if ('cyclomaticComplexity' in res.metrics) errors.push('Metric "cyclomaticComplexity" is deprecated; use "complexity"');
  }

  // 5. Issues fields
  if (!Array.isArray(res.issues)) {
    errors.push('Issues must be an array');
  } else {
    const requiredIssueKeys = [
      'id', 'rule', 'source', 'severity', 'category', 'title',
      'line', 'endLine', 'description', 'recommendation', 'confidence', 'fix',
    ];

    let prevIssue = null;
    res.issues.forEach((issue, idx) => {
      if (!issue || typeof issue !== 'object') {
        errors.push(`Issue at index ${idx} must be an object`);
        return;
      }

      for (const ik of requiredIssueKeys) {
        if (!(ik in issue)) {
          errors.push(`Issue at index ${idx} missing required key "${ik}"`);
        }
      }

      if (issue.source !== 'STATIC' && issue.source !== 'AI') {
        errors.push(`Issue at index ${idx} source must be "STATIC" or "AI", got: "${issue.source}"`);
      }

      if (!VALID_SEVERITIES.has(issue.severity)) {
        errors.push(`Issue at index ${idx} severity must be one of CRITICAL, HIGH, MEDIUM, LOW, got: "${issue.severity}"`);
      }

      if (!VALID_CATEGORIES.has(issue.category)) {
        errors.push(`Issue at index ${idx} category must be one of SECURITY, QUALITY, PERFORMANCE, COMPLEXITY, got: "${issue.category}"`);
      }

      if (typeof issue.line !== 'number' || !Number.isInteger(issue.line) || issue.line < 1) {
        errors.push(`Issue at index ${idx} line must be an integer >= 1, got: ${issue.line}`);
      }

      if (typeof issue.endLine !== 'number' || !Number.isInteger(issue.endLine) || issue.endLine < issue.line) {
        errors.push(`Issue at index ${idx} endLine must be an integer >= line, got: ${issue.endLine}`);
      }

      if (typeof issue.confidence !== 'number' || issue.confidence < 0 || issue.confidence > 1) {
        errors.push(`Issue at index ${idx} confidence must be between 0 and 1, got: ${issue.confidence}`);
      }

      const CONTROLLED_AI_RULES = new Set([
        'AI-LOGIC',
        'AI-SECURITY',
        'AI-PERFORMANCE',
        'AI-REACT',
        'AI-QUALITY',
        'AI-COMPLEXITY',
      ]);

      if (issue.source === 'STATIC') {
        if (issue.rule !== 'SYNTAX' && !RULE_REGISTRY[issue.rule]) {
          errors.push(`Issue at index ${idx} rule "${issue.rule}" is not registered in RULE_REGISTRY`);
        }
      } else if (issue.source === 'AI') {
        if (!CONTROLLED_AI_RULES.has(issue.rule)) {
          errors.push(`Issue at index ${idx} AI rule "${issue.rule}" is not in controlled AI rules namespace`);
        }
      }

      if (issue.fix !== null) {
        if (typeof issue.fix !== 'object' || typeof issue.fix.original !== 'string' || typeof issue.fix.replacement !== 'string') {
          errors.push(`Issue at index ${idx} fix must be null or { original: string, replacement: string }`);
        }
      }

      // Ordering check: Severity rank -> line -> rule -> id
      if (prevIssue) {
        const rankPrev = SEVERITY_ORDER[prevIssue.severity] ?? 99;
        const rankCurr = SEVERITY_ORDER[issue.severity] ?? 99;
        if (rankPrev > rankCurr) {
          errors.push(`Issue ordering violated at index ${idx}: lower severity before higher severity`);
        } else if (rankPrev === rankCurr) {
          if (prevIssue.line > issue.line) {
            errors.push(`Issue ordering violated at index ${idx}: line ${prevIssue.line} appears before line ${issue.line}`);
          } else if (prevIssue.line === issue.line) {
            const ruleCmp = (prevIssue.rule || '').localeCompare(issue.rule || '');
            if (ruleCmp > 0) {
              errors.push(`Issue ordering violated at index ${idx}: rule "${prevIssue.rule}" appears before "${issue.rule}"`);
            } else if (ruleCmp === 0) {
              const idCmp = (prevIssue.id || '').localeCompare(issue.id || '');
              if (idCmp > 0) {
                errors.push(`Issue ordering violated at index ${idx}: id "${prevIssue.id}" appears before "${issue.id}"`);
              }
            }
          }
        }
      }
      prevIssue = issue;
    });
  }

  // 6. Summary counts
  if (!res.summary || typeof res.summary !== 'object') {
    errors.push('Summary must be an object');
  } else {
    const { totalIssues, critical, high, medium, low } = res.summary;
    const issues = res.issues || [];
    const expectedCrit = issues.filter((i) => i.severity === 'CRITICAL').length;
    const expectedHigh = issues.filter((i) => i.severity === 'HIGH').length;
    const expectedMed = issues.filter((i) => i.severity === 'MEDIUM').length;
    const expectedLow = issues.filter((i) => i.severity === 'LOW').length;

    if (totalIssues !== issues.length) {
      errors.push(`Summary totalIssues (${totalIssues}) does not match issues.length (${issues.length})`);
    }
    if (critical !== expectedCrit) {
      errors.push(`Summary critical (${critical}) does not match counted CRITICAL issues (${expectedCrit})`);
    }
    if (high !== expectedHigh) {
      errors.push(`Summary high (${high}) does not match counted HIGH issues (${expectedHigh})`);
    }
    if (medium !== expectedMed) {
      errors.push(`Summary medium (${medium}) does not match counted MEDIUM issues (${expectedMed})`);
    }
    if (low !== expectedLow) {
      errors.push(`Summary low (${low}) does not match counted LOW issues (${expectedLow})`);
    }
  }

  // 7. Metadata validation
  if (!res.metadata || typeof res.metadata !== 'object') {
    errors.push('Metadata must be an object');
  } else {
    if (res.metadata.engine !== 'static' && res.metadata.engine !== 'hybrid') {
      errors.push(`Metadata engine must be "static" or "hybrid", got: "${res.metadata.engine}"`);
    }
    if (res.metadata.aiStatus && !['USED', 'UNAVAILABLE', 'VALIDATION_FAILED'].includes(res.metadata.aiStatus)) {
      errors.push(`Metadata aiStatus must be one of "USED", "UNAVAILABLE", "VALIDATION_FAILED", got: "${res.metadata.aiStatus}"`);
    }
    if (typeof res.metadata.language !== 'string' || !res.metadata.language) {
      errors.push('Metadata language must be a non-empty string');
    }
    if (typeof res.metadata.filename !== 'string' || !res.metadata.filename) {
      errors.push('Metadata filename must be a non-empty string');
    }
    if (typeof res.metadata.codeHash !== 'string' || !/^[0-9a-f]{64}$/.test(res.metadata.codeHash)) {
      errors.push(`Metadata codeHash must be a 64-char lowercase hexadecimal string, got: "${res.metadata.codeHash}"`);
    }
    if ('timestamp' in res.metadata) {
      errors.push('Metadata must not contain "timestamp" for deterministic static reviews');
    }
    if ('requestId' in res.metadata) {
      errors.push('Metadata must not contain "requestId"');
    }
    if ('version' in res.metadata) {
      errors.push('Metadata must not contain "version"');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
