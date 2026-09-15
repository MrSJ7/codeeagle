import path from 'path';
import _traverse from '@babel/traverse';
import { parseSource } from '../analyzers/parser.js';
import { PROJECT_LIMITS } from '../config/limits.js';

const traverse = _traverse.default || _traverse;

/**
 * Extracts all imports and exports from a JavaScript/JSX AST.
 * Handles ES Modules (import/export), dynamic import(), and CommonJS (require/exports).
 * 
 * @param {object} ast Babel AST
 * @param {string} code Source code string
 * @returns {{
 *   imports: Array<{ specifier: string, kind: string, symbols: string[], line: number }>,
 *   exports: Array<{ name: string, kind: string, line: number }>,
 *   externalPackages: string[]
 * }}
 */
export function extractFileDependencies(ast, code = '') {
  const imports = [];
  const exports = [];
  const externalPackages = new Set();
  const seenImports = new Set();

  if (!ast) {
    return { imports, exports, externalPackages: [] };
  }

  traverse(ast, {
    // ES Module Imports: import ... from '...'
    ImportDeclaration(astPath) {
      const specifier = astPath.node.source?.value;
      if (!specifier) return;

      const symbols = [];
      for (const s of astPath.node.specifiers || []) {
        if (s.type === 'ImportDefaultSpecifier') {
          symbols.push('default');
        } else if (s.type === 'ImportNamespaceSpecifier') {
          symbols.push(`* as ${s.local?.name || 'ns'}`);
        } else if (s.type === 'ImportSpecifier') {
          const importedName = s.imported?.type === 'Identifier' ? s.imported.name : (s.imported?.value || s.local?.name);
          if (importedName) symbols.push(importedName);
        }
      }

      const line = astPath.node.loc?.start.line || 1;
      const key = `${specifier}:${line}`;
      if (!seenImports.has(key)) {
        seenImports.add(key);
        imports.push({
          specifier,
          kind: 'es-import',
          symbols: symbols.length > 0 ? symbols : ['*'],
          line,
        });
      }

      if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
        const pkgName = extractPackageBaseName(specifier);
        if (pkgName) externalPackages.add(pkgName);
      }
    },

    // ES Module Exports
    ExportDefaultDeclaration(astPath) {
      const line = astPath.node.loc?.start.line || 1;
      exports.push({
        name: 'default',
        kind: 'export-default',
        line,
      });
    },

    ExportNamedDeclaration(astPath) {
      const line = astPath.node.loc?.start.line || 1;

      // Re-export: export { a } from './b'
      if (astPath.node.source?.value) {
        const specifier = astPath.node.source.value;
        const symbols = (astPath.node.specifiers || []).map((s) => s.exported?.name || 'default');
        const key = `${specifier}:${line}`;
        if (!seenImports.has(key)) {
          seenImports.add(key);
          imports.push({
            specifier,
            kind: 're-export',
            symbols,
            line,
          });
        }
        if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
          const pkgName = extractPackageBaseName(specifier);
          if (pkgName) externalPackages.add(pkgName);
        }
      }

      if (astPath.node.declaration) {
        const decl = astPath.node.declaration;
        if (decl.type === 'VariableDeclaration') {
          for (const d of decl.declarations || []) {
            if (d.id?.type === 'Identifier') {
              exports.push({ name: d.id.name, kind: 'export-named', line });
            } else if (d.id?.type === 'ObjectPattern') {
              for (const p of d.id.properties || []) {
                if (p.key?.name) {
                  exports.push({ name: p.key.name, kind: 'export-named', line });
                }
              }
            }
          }
        } else if (decl.type === 'FunctionDeclaration' && decl.id?.name) {
          exports.push({ name: decl.id.name, kind: 'export-named', line });
        } else if (decl.type === 'ClassDeclaration' && decl.id?.name) {
          exports.push({ name: decl.id.name, kind: 'export-named', line });
        }
      }

      for (const s of astPath.node.specifiers || []) {
        const name = s.exported?.type === 'Identifier' ? s.exported.name : s.exported?.value;
        if (name) {
          exports.push({ name, kind: 'export-named', line });
        }
      }
    },

    ExportAllDeclaration(astPath) {
      const specifier = astPath.node.source?.value;
      const line = astPath.node.loc?.start.line || 1;
      if (specifier) {
        const key = `${specifier}:${line}`;
        if (!seenImports.has(key)) {
          seenImports.add(key);
          imports.push({
            specifier,
            kind: 're-export-all',
            symbols: ['*'],
            line,
          });
        }
        exports.push({ name: '*', kind: 'export-all', line });
        if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
          const pkgName = extractPackageBaseName(specifier);
          if (pkgName) externalPackages.add(pkgName);
        }
      }
    },

    // Dynamic import: import('...') and CommonJS require('...')
    CallExpression(astPath) {
      const callee = astPath.node.callee;
      const line = astPath.node.loc?.start.line || 1;

      // CommonJS require('...')
      if (
        callee.type === 'Identifier' &&
        callee.name === 'require' &&
        astPath.node.arguments[0]?.type === 'StringLiteral'
      ) {
        const specifier = astPath.node.arguments[0].value;
        const key = `${specifier}:${line}`;
        if (!seenImports.has(key)) {
          seenImports.add(key);
          imports.push({
            specifier,
            kind: 'cjs-require',
            symbols: ['*'],
            line,
          });
        }
        if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
          const pkgName = extractPackageBaseName(specifier);
          if (pkgName) externalPackages.add(pkgName);
        }
      }

      // Dynamic import('...')
      if (
        callee.type === 'Import' &&
        astPath.node.arguments[0]?.type === 'StringLiteral'
      ) {
        const specifier = astPath.node.arguments[0].value;
        const key = `${specifier}:${line}`;
        if (!seenImports.has(key)) {
          seenImports.add(key);
          imports.push({
            specifier,
            kind: 'dynamic-import',
            symbols: ['*'],
            line,
          });
        }
        if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
          const pkgName = extractPackageBaseName(specifier);
          if (pkgName) externalPackages.add(pkgName);
        }
      }
    },

    // CommonJS module.exports or exports.prop
    AssignmentExpression(astPath) {
      const left = astPath.node.left;
      const line = astPath.node.loc?.start.line || 1;

      if (left.type === 'MemberExpression') {
        // module.exports = ...
        if (
          left.object?.type === 'Identifier' &&
          left.object.name === 'module' &&
          left.property?.type === 'Identifier' &&
          left.property.name === 'exports'
        ) {
          exports.push({ name: 'default', kind: 'module.exports', line });
        }
        // exports.foo = ...
        else if (
          left.object?.type === 'Identifier' &&
          left.object.name === 'exports' &&
          left.property?.type === 'Identifier'
        ) {
          exports.push({ name: left.property.name, kind: 'exports.prop', line });
        }
      }
    },
  });

  return {
    imports,
    exports,
    externalPackages: Array.from(externalPackages),
  };
}

/**
 * Extracts base npm package name from specifier (e.g. '@babel/core/lib' -> '@babel/core', 'lodash/get' -> 'lodash').
 */
function extractPackageBaseName(specifier = '') {
  const parts = specifier.split('/');
  if (specifier.startsWith('@') && parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0] || specifier;
}

/**
 * Safely resolves an import specifier relative to the importing file against known manifest files.
 * 
 * @param {string} specifier Import string (e.g. './token', '../utils/db.js', 'react')
 * @param {string} importerFilePath POSIX path of current file (e.g. 'src/auth.js')
 * @param {Set<string>} allProjectPathsSet Set of all project POSIX paths
 * @returns {{
 *   specifier: string,
 *   resolvedPath: string | null,
 *   isLocal: boolean,
 *   isExternal: boolean,
 *   unresolved: boolean
 * }}
 */
export function resolveImportSpecifier(specifier = '', importerFilePath = '', allProjectPathsSet = new Set()) {
  const isRelative = specifier.startsWith('.') || specifier.startsWith('/');

  if (!isRelative) {
    return {
      specifier,
      resolvedPath: null,
      isLocal: false,
      isExternal: true,
      unresolved: false,
    };
  }

  // importer directory
  const currentDir = path.posix.dirname(importerFilePath);
  let normalized = path.posix.normalize(path.posix.join(currentDir, specifier));

  // Strip leading dot/slash if any
  if (normalized.startsWith('./')) {
    normalized = normalized.slice(2);
  }

  // Candidate extensions
  const candidates = [
    normalized,
    `${normalized}.js`,
    `${normalized}.jsx`,
    `${normalized}.mjs`,
    `${normalized}.cjs`,
    `${normalized}/index.js`,
    `${normalized}/index.jsx`,
    `${normalized}/index.mjs`,
    `${normalized}.json`,
  ];

  for (const candidate of candidates) {
    if (allProjectPathsSet.has(candidate)) {
      return {
        specifier,
        resolvedPath: candidate,
        isLocal: true,
        isExternal: false,
        unresolved: false,
      };
    }
  }

  return {
    specifier,
    resolvedPath: normalized,
    isLocal: true,
    isExternal: false,
    unresolved: true,
  };
}

/**
 * Detects circular dependency cycles using Depth-First Search (DFS).
 * 
 * @param {Map<string, Set<string>>} adjacencyList Map of filePath -> Set<importedFilePaths>
 * @returns {Array<Array<string>>} Array of detected cycles
 */
export function detectDependencyCycles(adjacencyList) {
  const visited = new Set();
  const recStack = new Set();
  const currentPath = [];
  const detectedCycles = [];
  const cycleSignatures = new Set();

  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    currentPath.push(node);

    const neighbors = adjacencyList.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        // Cycle found: extract cycle slice
        const cycleStartIndex = currentPath.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const cycle = currentPath.slice(cycleStartIndex);
          cycle.push(neighbor); // Close cycle loop
          // Canonical signature to avoid permutations
          const canonical = [...cycle.slice(0, -1)].sort().join('->');
          if (!cycleSignatures.has(canonical)) {
            cycleSignatures.add(canonical);
            detectedCycles.push(cycle);
          }
        }
      }
    }

    currentPath.pop();
    recStack.delete(node);
  }

  for (const node of adjacencyList.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return detectedCycles;
}

/**
 * Builds comprehensive Project Context Index across all files in a project manifest.
 * 
 * @param {Array<{ id: string, path: string, content?: string, language?: string, lineCount?: number }>} files
 * @param {Array<object>} staticIssues Static analysis issues already discovered
 * @returns {ProjectContext}
 */
export function buildProjectContext(files = [], staticIssues = []) {
  const allPathsSet = new Set(files.map((f) => f.path));
  const fileMap = new Map();
  files.forEach((f) => fileMap.set(f.path, f));

  // Issues mapped by file path
  const issuesByPath = new Map();
  for (const issue of staticIssues || []) {
    const p = issue.path || issue.fileId;
    if (p) {
      if (!issuesByPath.has(p)) issuesByPath.set(p, []);
      issuesByPath.get(p).push(issue);
    }
  }

  // Node graph
  const nodes = new Map();
  const adjacencyList = new Map();
  const incomingAdjacency = new Map();

  // Initialize node structures
  for (const file of files) {
    nodes.set(file.path, {
      path: file.path,
      fileId: file.id,
      language: file.language || 'javascript',
      lineCount: file.lineCount || 0,
      imports: [],
      exports: [],
      externalPackages: [],
      fanOut: 0,
      fanIn: 0,
      hasCycle: false,
    });
    adjacencyList.set(file.path, new Set());
    incomingAdjacency.set(file.path, new Set());
  }

  // Parse dependencies for JavaScript / JSX files
  for (const file of files) {
    const isJs = file.language === 'javascript' || file.language === 'jsx' || file.path.endsWith('.js') || file.path.endsWith('.jsx');
    if (!isJs || !file.content) continue;

    const { ast } = parseSource(file.content, file.language);
    if (!ast) continue;

    const { imports, exports, externalPackages } = extractFileDependencies(ast, file.content);
    const node = nodes.get(file.path);
    node.exports = exports;
    node.externalPackages = externalPackages;

    for (const imp of imports) {
      const resolved = resolveImportSpecifier(imp.specifier, file.path, allPathsSet);
      node.imports.push({
        ...imp,
        resolvedPath: resolved.resolvedPath,
        isLocal: resolved.isLocal,
        isExternal: resolved.isExternal,
        unresolved: resolved.unresolved,
      });

      if (resolved.isLocal && !resolved.unresolved && resolved.resolvedPath) {
        adjacencyList.get(file.path).add(resolved.resolvedPath);
        if (incomingAdjacency.has(resolved.resolvedPath)) {
          incomingAdjacency.get(resolved.resolvedPath).add(file.path);
        }
      }
    }
  }

  // Compute metrics: fanIn, fanOut
  for (const [filePath, node] of nodes.entries()) {
    node.fanOut = adjacencyList.get(filePath)?.size || 0;
    node.fanIn = incomingAdjacency.get(filePath)?.size || 0;
  }

  // Detect dependency cycles
  const cycles = detectDependencyCycles(adjacencyList);
  const cycleFiles = new Set(cycles.flat());
  for (const filePath of cycleFiles) {
    if (nodes.has(filePath)) {
      nodes.get(filePath).hasCycle = true;
    }
  }

  // Topology identification
  const entrypoints = [];
  const leafNodes = [];
  let totalEdges = 0;

  for (const [filePath, node] of nodes.entries()) {
    totalEdges += node.fanOut;
    if (node.fanIn === 0 && node.fanOut > 0) {
      entrypoints.push(filePath);
    } else if (node.fanOut === 0 && node.fanIn > 0) {
      leafNodes.push(filePath);
    }
  }

  // Central hubs (files with highest total cross-file connectivity)
  const centralFiles = Array.from(nodes.values())
    .map((n) => ({ path: n.path, fanIn: n.fanIn, fanOut: n.fanOut, totalDegree: n.fanIn + n.fanOut }))
    .filter((n) => n.totalDegree > 0)
    .sort((a, b) => b.totalDegree - a.totalDegree)
    .slice(0, 10);

  /**
   * Distills local context for a candidate target file, respecting strict byte budgeting.
   * Includes target source, directly imported files, and relevant symbols.
   */
  function buildDistilledContext(targetFilePath, maxBytes = PROJECT_LIMITS.MAX_AI_CONTEXT_BYTES) {
    const targetFile = fileMap.get(targetFilePath);
    if (!targetFile) return null;

    const targetNode = nodes.get(targetFilePath) || {
      imports: [],
      exports: [],
      externalPackages: [],
      fanIn: 0,
      fanOut: 0,
      hasCycle: false,
    };

    const targetIssues = issuesByPath.get(targetFilePath) || [];
    const directImportPaths = Array.from(adjacencyList.get(targetFilePath) || []);
    const directImporterPaths = Array.from(incomingAdjacency.get(targetFilePath) || []);

    // Build distilled dependencies
    const distilledDeps = [];
    let currentBytes = (targetFile.content?.length || 0);

    for (const depPath of directImportPaths) {
      const depFile = fileMap.get(depPath);
      const depNode = nodes.get(depPath);
      if (!depFile) continue;

      const exportsList = (depNode?.exports || []).map((e) => e.name);
      const depSize = depFile.content?.length || 0;

      // Check if we can include full source or interface summary
      if (currentBytes + depSize < maxBytes * 0.85) {
        distilledDeps.push({
          path: depPath,
          role: 'imported',
          exports: exportsList,
          content: depFile.content,
          isFullSource: true,
        });
        currentBytes += depSize;
      } else {
        // Distill to signature/header summary
        const summary = extractInterfaceSummary(depFile.content, exportsList);
        distilledDeps.push({
          path: depPath,
          role: 'imported',
          exports: exportsList,
          content: summary,
          isFullSource: false,
        });
        currentBytes += summary.length;
      }
    }

    // Associated cycles for this file
    const fileCycles = cycles.filter((c) => c.includes(targetFilePath));

    return {
      targetFile: {
        path: targetFile.path,
        language: targetFile.language || 'javascript',
        content: targetFile.content,
        lineCount: targetFile.lineCount || 0,
        exports: targetNode.exports.map((e) => e.name),
        fanIn: targetNode.fanIn,
        fanOut: targetNode.fanOut,
        hasCycle: targetNode.hasCycle,
      },
      directDependencies: distilledDeps,
      directImporters: directImporterPaths,
      externalPackages: targetNode.externalPackages,
      staticIssues: targetIssues,
      cycles: fileCycles,
      contextBytes: currentBytes,
    };
  }

  return {
    nodes,
    cycles,
    topology: {
      totalFiles: files.length,
      crossFileEdges: totalEdges,
      cyclesDetected: cycles.length,
      entrypoints,
      leafNodes,
      centralFiles,
    },
    buildDistilledContext,
  };
}

/**
 * Creates a lightweight interface summary of a file when full source exceeds context budget.
 */
function extractInterfaceSummary(content = '', exportsList = []) {
  if (!content) return '// Empty file';
  const lines = content.split('\n');
  const signatureLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.startsWith('export ') ||
      line.startsWith('import ') ||
      line.includes('function ') ||
      line.includes('class ') ||
      line.includes('module.exports') ||
      line.includes('exports.')
    ) {
      signatureLines.push(line.trim());
    }
  }

  return signatureLines.join('\n') || `// Exports: ${exportsList.join(', ')}`;
}
