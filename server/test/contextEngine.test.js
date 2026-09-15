/**
 * Comprehensive Context-Aware Hybrid Review Engine Test Suite.
 * Tests AST dependency extraction, path resolution, graph topology, cycle detection,
 * context distillation, grounded AI validation, anti-double-counting scoring,
 * and multi-file fixture processing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  extractFileDependencies,
  resolveImportSpecifier,
  detectDependencyCycles,
  buildProjectContext,
} from '../src/services/projectContextService.js';
import { parseSource } from '../src/analyzers/parser.js';
import {
  validateAiFinding,
  validateAiResponse,
  filterGroundedAiFindings,
} from '../src/services/aiValidator.js';
import {
  calculateProjectScore,
  calculateFindingPriority,
} from '../src/services/projectScoreCalculator.js';
import { deduplicateAiAgainstStatic } from '../src/services/issueDeduplicator.js';
import { selectAiCandidateFiles, runProjectAiReview } from '../src/services/projectAiService.js';
import { executeProjectReview } from '../src/services/projectReviewService.js';
import { setGeminiClientOverride } from '../src/services/geminiService.js';
import { buildContextAwarePrompt } from '../src/services/geminiPrompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function runContextEngineTests() {
  console.log('=== Starting CodeEagle Context-Aware Hybrid Review Engine Tests ===\n');

  // -------------------------------------------------------------
  // 1. AST Import & Export Extraction Tests
  // -------------------------------------------------------------
  console.log('--- 1. AST Import & Export Extraction ---');
  {
    const source = `
      import React, { useState, useEffect as useEff } from 'react';
      import * as utils from './utils.js';
      import './side-effect.css';
      const lodash = require('lodash');
      const { helper } = require('./helper');

      export const API_KEY = 'secret';
      export function login(user) { return user; }
      export default class AuthService {}
      export { utils };
      export * from './tokens.js';
    `;

    const { ast } = parseSource(source, 'jsx');
    assert(ast !== null, 'Successfully parsed test source into AST');

    const deps = extractFileDependencies(ast, source);
    assert(deps.imports.length >= 6, `Extracted ${deps.imports.length} imports (expected >= 6)`);
    assert(deps.externalPackages.includes('react'), 'Identified external package "react"');
    assert(deps.externalPackages.includes('lodash'), 'Identified external package "lodash"');

    const hasEsImport = deps.imports.some((i) => i.specifier === 'react' && i.kind === 'es-import');
    assert(hasEsImport, 'Extracted ES import declaration');

    const hasCjsRequire = deps.imports.some((i) => i.specifier === 'lodash' && i.kind === 'cjs-require');
    assert(hasCjsRequire, 'Extracted CommonJS require call');

    const exportNames = deps.exports.map((e) => e.name);
    assert(exportNames.includes('API_KEY'), 'Extracted named export "API_KEY"');
    assert(exportNames.includes('login'), 'Extracted function export "login"');
    assert(exportNames.includes('default'), 'Extracted default export');
  }

  // -------------------------------------------------------------
  // 2. Safe POSIX Import Path Resolution
  // -------------------------------------------------------------
  console.log('\n--- 2. POSIX Path Normalization & Manifest Resolution ---');
  {
    const projectFiles = new Set([
      'src/auth.js',
      'src/token.js',
      'src/components/Login.jsx',
      'src/utils/index.js',
      'package.json',
    ]);

    // Exact match
    const r1 = resolveImportSpecifier('./token.js', 'src/auth.js', projectFiles);
    assert(r1.resolvedPath === 'src/token.js' && r1.isLocal, 'Resolved exact match "./token.js"');

    // Extensionless match (.js)
    const r2 = resolveImportSpecifier('./token', 'src/auth.js', projectFiles);
    assert(r2.resolvedPath === 'src/token.js' && r2.isLocal, 'Resolved extensionless "./token" -> "src/token.js"');

    // Parent directory traversal + extensionless JSX
    const r3 = resolveImportSpecifier('../components/Login', 'src/controllers/auth.js', projectFiles);
    assert(r3.resolvedPath === 'src/components/Login.jsx', 'Resolved parent path "../components/Login" -> "src/components/Login.jsx"');

    // Index directory match
    const r4 = resolveImportSpecifier('./utils', 'src/auth.js', projectFiles);
    assert(r4.resolvedPath === 'src/utils/index.js', 'Resolved index directory "./utils" -> "src/utils/index.js"');

    // External npm package
    const r5 = resolveImportSpecifier('express', 'src/auth.js', projectFiles);
    assert(r5.isExternal && r5.resolvedPath === null, 'Identified external package "express"');

    // Unresolved local import
    const r6 = resolveImportSpecifier('./nonexistent', 'src/auth.js', projectFiles);
    assert(r6.isLocal && r6.unresolved, 'Flagged missing local import as unresolved');
  }

  // -------------------------------------------------------------
  // 3. Dependency Graph & Cycle Detection
  // -------------------------------------------------------------
  console.log('\n--- 3. Dependency Graph & Cycle Detection ---');
  {
    const files = [
      { id: '1', path: 'src/a.js', content: 'import "./b.js"; export const a = 1;', language: 'javascript' },
      { id: '2', path: 'src/b.js', content: 'import "./c.js"; export const b = 2;', language: 'javascript' },
      { id: '3', path: 'src/c.js', content: 'import "./a.js"; export const c = 3;', language: 'javascript' },
      { id: '4', path: 'src/leaf.js', content: 'export const leaf = true;', language: 'javascript' },
    ];

    const context = buildProjectContext(files);
    assert(context.cycles.length > 0, 'Detected circular dependency cycle');
    assert(context.nodes.get('src/a.js').hasCycle === true, 'Marked node "src/a.js" as having cycles');
    assert(context.nodes.get('src/leaf.js').hasCycle === false, 'Leaf node hasCycle is false');
    assert(context.nodes.get('src/a.js').fanOut === 1, 'src/a.js fanOut is 1');
    assert(context.nodes.get('src/a.js').fanIn === 1, 'src/a.js fanIn is 1');
  }

  // -------------------------------------------------------------
  // 4. Bounded Context Distillation & Budget Cap
  // -------------------------------------------------------------
  console.log('\n--- 4. Context Distillation & 48KB Budget Cap ---');
  {
    const files = [
      { id: '1', path: 'src/main.js', content: 'import { helper } from "./helper.js"; console.log(helper());', language: 'javascript' },
      { id: '2', path: 'src/helper.js', content: 'export function helper() { return "ok"; }', language: 'javascript' },
    ];

    const context = buildProjectContext(files);
    const distilled = context.buildDistilledContext('src/main.js', 48 * 1024);

    assert(distilled !== null, 'Generated distilled context for main.js');
    assert(distilled.targetFile.path === 'src/main.js', 'Target file matches requested file');
    assert(distilled.directDependencies.length === 1, 'Contains 1 direct dependency');
    assert(distilled.directDependencies[0].path === 'src/helper.js', 'Direct dependency is helper.js');
    assert(distilled.contextBytes <= 48 * 1024, 'Context strictly respects 48KB budget cap');

    const prompt = buildContextAwarePrompt({ distilledContext: distilled });
    assert(prompt.includes('=== TARGET FILE TO REVIEW ==='), 'Prompt includes target file section');
    assert(prompt.includes('src/helper.js'), 'Prompt includes dependency module context');
  }

  // -------------------------------------------------------------
  // 5. Grounded AI Validation & Hallucination Defense
  // -------------------------------------------------------------
  console.log('\n--- 5. Grounded AI Validation & Hallucination Defense ---');
  {
    const sampleCode = `function calculateTax(amount) {\n  return amount * 0.15;\n}`;

    // Valid grounded finding
    const validFinding = {
      rule: 'SEM-PRECISION',
      severity: 'HIGH',
      category: 'QUALITY',
      title: 'Floating point precision loss in currency computation',
      line: 2,
      endLine: 2,
      description: 'Multiplying currency by 0.15 directly can cause IEEE-754 precision artifacts.',
      recommendation: 'Use integer cents or a decimal library.',
      confidence: 0.90,
      evidence: 'return amount * 0.15;',
      fix: null,
    };

    const resValid = validateAiFinding(validFinding, 2, sampleCode);
    assert(resValid.valid === true, 'Grounded AI finding accepted');
    assert(resValid.sanitized.evidence === 'return amount * 0.15;', 'Preserved verbatim evidence');

    // Reject style noise
    const styleFinding = {
      rule: 'STYLE-COMMENT',
      severity: 'LOW',
      category: 'QUALITY',
      title: 'Missing JSDoc comment',
      line: 1,
      endLine: 1,
      description: 'Consider adding JSDoc comment for the function',
      recommendation: 'Add JSDoc tags.',
      confidence: 0.85,
      fix: null,
    };

    const filtered = filterGroundedAiFindings([validFinding, styleFinding], { minConfidence: 0.70 });
    assert(filtered.length === 1, 'Filtered out superficial cosmetic style complaint');
    assert(filtered[0].rule === 'SEM-PRECISION', 'Retained high-value semantic finding');

    // Reject confidence < 0.70
    const lowConfFinding = { ...validFinding, confidence: 0.55 };
    const filteredConf = filterGroundedAiFindings([lowConfFinding], { minConfidence: 0.70 });
    assert(filteredConf.length === 0, 'Rejected AI finding below 0.70 confidence threshold');
  }

  // -------------------------------------------------------------
  // 6. Explainable Priority Ranking & Anti-Double Counting
  // -------------------------------------------------------------
  console.log('\n--- 6. Priority Ranking & Anti-Double-Counting Scoring ---');
  {
    const issue1 = {
      severity: 'CRITICAL',
      confidence: 0.98,
      evidence: 'process.env.SECRET',
      category: 'SECURITY',
      line: 5,
      endLine: 5,
    };
    const issue2 = {
      severity: 'LOW',
      confidence: 0.50,
      category: 'QUALITY',
      line: 12,
      endLine: 12,
    };

    const p1 = calculateFindingPriority(issue1);
    const p2 = calculateFindingPriority(issue2);
    assert(p1 > p2, `Critical security finding priority (${p1}) exceeds low finding (${p2})`);
    assert(p1 >= 0.90, `Critical high-confidence priority >= 0.90 (got ${p1})`);

    // Anti-double-counting maintainability cap: 10 low findings capped at 15 points
    const tenLowIssues = Array.from({ length: 10 }, (_, i) => ({
      id: `QUAL-VAR-${i}`,
      rule: 'QUAL-VAR',
      severity: 'LOW',
      category: 'QUALITY',
      ruleClass: 'MAINTAINABILITY',
      line: i + 1,
      endLine: i + 1,
    }));

    const health = calculateProjectScore(tenLowIssues, 5);
    // Without cap: 10 * 3 = 30 deduction (score 70). With cap: max 15 deduction (score 85).
    assert(health.score === 85, `Maintainability heuristics capped at 15 pts deduction (got ${health.score}, expected 85)`);
  }

  // -------------------------------------------------------------
  // 7. Deterministic Enrichment in Deduplication
  // -------------------------------------------------------------
  console.log('\n--- 7. Deterministic Finding Enrichment ---');
  {
    const staticIssues = [
      {
        id: 'SEC-SECRET-1',
        rule: 'SEC-SECRET',
        source: 'STATIC',
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Hardcoded credential',
        line: 5,
        endLine: 5,
        description: 'Hardcoded secret literal.',
        confidence: 0.98,
      },
    ];

    const aiIssues = [
      {
        id: 'AI-1',
        rule: 'SEM-SECRET-EXPOSURE',
        source: 'AI',
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Exposed credential can leak via source control',
        line: 5,
        endLine: 5,
        description: 'API credential is hardcoded in the authentication router.',
        recommendation: 'Store in environment variables.',
        confidence: 0.92,
      },
    ];

    const { deduplicatedAiIssues, enrichedStaticIssues } = deduplicateAiAgainstStatic(staticIssues, aiIssues);
    assert(deduplicatedAiIssues.length === 0, 'AI duplicate successfully pruned');
    assert(enrichedStaticIssues.length === 1, 'Static finding preserved as authoritative');
    assert(enrichedStaticIssues[0].engine === 'HYBRID', 'Static finding marked with HYBRID engine tag');
    assert(enrichedStaticIssues[0].aiEnrichment !== undefined, 'Attached AI contextual enrichment');
    assert(enrichedStaticIssues[0].aiEnrichment.confidence === 0.92, 'Preserved AI corroboration confidence');
  }

  // -------------------------------------------------------------
  // 8. Multi-File Sample Project End-to-End Review
  // -------------------------------------------------------------
  console.log('\n--- 8. Multi-File Sample Project Review Execution ---');
  {
    const fixtureDir = path.join(__dirname, 'fixtures/sample-project');
    const filesToRead = [
      'package.json',
      'src/config.js',
      'src/token.js',
      'src/auth.js',
      'src/components/Login.jsx',
      'src/components/Feed.jsx',
      'server/db.js',
      'server/routes.js',
      'src/clean.js',
    ];

    const files = filesToRead.map((rel, idx) => {
      const full = path.join(fixtureDir, rel);
      const content = fs.readFileSync(full, 'utf8');
      const isJs = rel.endsWith('.js') || rel.endsWith('.jsx');
      return {
        id: `f_${idx + 1}`,
        path: rel,
        filename: path.basename(rel),
        content,
        lineCount: content.split('\n').length,
        size: Buffer.byteLength(content, 'utf8'),
        status: isJs || rel.endsWith('.json') ? 'ELIGIBLE' : 'SKIPPED',
        language: rel.endsWith('.jsx') ? 'jsx' : rel.endsWith('.json') ? 'json' : 'javascript',
        contentHash: 'hash_' + idx,
      };
    });

    const manifest = {
      id: 'proj_sample_test',
      name: 'sample-project',
      sourceType: 'folder',
      sourceMetadata: { folderName: 'sample-project' },
      projectSourceHash: 'sample_project_hash_12345',
      totalFileCount: files.length,
      eligibleFileCount: files.length,
      skippedFileCount: 0,
      files,
    };

    // Run review with simulated Gemini hybrid client
    const mockAiClient = {
      models: {
        generateContent: async ({ contents }) => ({
          text: JSON.stringify({
            summary: 'Cross-module dependency contracts and authentication paths evaluated.',
            findings: [
              {
                rule: 'SEM-AUTH-FLOW',
                severity: 'HIGH',
                category: 'SECURITY',
                title: 'Static administrative credential check bypasses vault lookup',
                line: 7,
                endLine: 9,
                description: 'Hardcoded admin check in authenticateUser allows backdoor login without auditing.',
                recommendation: 'Query hashed user database instead of hardcoded equality.',
                confidence: 0.90,
                evidence: "if (username === 'admin' && password === 'admin')",
                fix: null,
              },
            ],
          }),
        }),
      },
    };

    setGeminiClientOverride(mockAiClient);

    const review = await executeProjectReview({ manifest });

    assert(review.status === 'complete', 'Project review completed successfully');
    assert(review.engine === 'hybrid', `Review engine is "hybrid" (got "${review.engine}")`);
    assert(review.contextTopology !== undefined, 'Review snapshot includes contextTopology');
    assert(review.contextTopology.totalCrossFileEdges > 0, `Captured ${review.contextTopology.totalCrossFileEdges} cross-file dependency edges`);
    assert(review.topPriorities.length > 0, 'Generated prioritized top findings');

    // Confirm SEC-SECRET is caught and ranked high
    const secretFinding = review.findings.find((f) => f.rule === 'SEC-SECRET');
    assert(secretFinding !== undefined, 'Detected SEC-SECRET in src/auth.js');
    assert(secretFinding.path === 'src/auth.js', 'Finding anchored to src/auth.js');

    // Confirm Dangerous HTML is caught
    const htmlFinding = review.findings.find((f) => f.rule === 'SEC-DANGEROUS-HTML');
    assert(htmlFinding !== undefined, 'Detected SEC-DANGEROUS-HTML in src/components/Login.jsx');

    // Confirm SQL injection is caught
    const sqlFinding = review.findings.find((f) => f.rule === 'SEC-SQLI');
    assert(sqlFinding !== undefined, 'Detected SEC-SQLI in server/db.js');

    // Reset client override
    setGeminiClientOverride(null);
  }

  // -------------------------------------------------------------
  // 9. 30-File Large Project Processing & Memory Safety
  // -------------------------------------------------------------
  console.log('\n--- 9. 30-File Large Project Scaling & Memory Safety ---');
  {
    const largeFixtureDir = path.join(__dirname, 'fixtures/large-project');
    const allFixtureFiles = [];

    function walkDir(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full);
        } else {
          allFixtureFiles.push(full);
        }
      }
    }
    walkDir(largeFixtureDir);

    assert(allFixtureFiles.length >= 30, `Loaded ${allFixtureFiles.length} files from large-project fixture (expected >= 30)`);

    const manifestFiles = allFixtureFiles.map((full, idx) => {
      const rel = path.relative(largeFixtureDir, full);
      const content = fs.readFileSync(full, 'utf8');
      const isJs = rel.endsWith('.js') || rel.endsWith('.jsx');
      return {
        id: `lf_${idx + 1}`,
        path: rel,
        filename: path.basename(rel),
        content,
        lineCount: content.split('\n').length,
        size: Buffer.byteLength(content, 'utf8'),
        status: isJs || rel.endsWith('.json') ? 'ELIGIBLE' : 'SKIPPED',
        language: rel.endsWith('.jsx') ? 'jsx' : rel.endsWith('.json') ? 'json' : 'javascript',
        contentHash: 'hash_lg_' + idx,
      };
    });

    const startMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();

    const largeContext = buildProjectContext(manifestFiles);
    const duration = Date.now() - startTime;
    const memoryUsedMB = (process.memoryUsage().heapUsed - startMemory) / (1024 * 1024);

    assert(largeContext.topology.totalFiles >= 30, `Indexed all ${largeContext.topology.totalFiles} files in graph`);
    assert(largeContext.topology.crossFileEdges > 10, `Extracted ${largeContext.topology.crossFileEdges} cross-file dependency edges`);
    assert(duration < 2000, `Large project graph built in ${duration}ms (< 2000ms bound)`);
    assert(memoryUsedMB < 50, `Heap memory usage remained bounded (${memoryUsedMB.toFixed(2)} MB < 50 MB)`);
  }

  // -------------------------------------------------------------
  // 10. Live Double Engine Verification (Graceful Fallback)
  // -------------------------------------------------------------
  console.log('\n--- 10. Double Engine Status Verification ---');
  {
    // Test that when Gemini is unconfigured or null, engine safely falls back to 'static'
    setGeminiClientOverride(null);
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const files = [
      { id: '1', path: 'src/app.js', content: 'const a = 1;', language: 'javascript', status: 'ELIGIBLE' }
    ];
    const fileResults = new Map();
    fileResults.set('1', { id: '1', issues: [], metrics: { complexity: 1, branches: 0 } });

    const reviewRes = await runProjectAiReview({
      projectId: 'p_test',
      reviewId: 'r_test',
      files,
      fileResults,
    });

    assert(reviewRes.engine === 'static', 'Engine is "static" when Gemini is unconfigured');

    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  }

  console.log(`\n=== Final Context Engine Test Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runContextEngineTests().catch((err) => {
  console.error('Unhandled error in contextEngine test suite:', err);
  process.exit(1);
});
