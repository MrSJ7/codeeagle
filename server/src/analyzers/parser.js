import * as babelParser from '@babel/parser';

/**
 * Parses modern JavaScript / JSX safely without code execution.
 * Returns either the parsed AST or a structured syntaxError object.
 */
export function parseSource(code = '', language = 'javascript') {
  try {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      plugins: [
        'jsx',
        'asyncGenerators',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'nullishCoalescingOperator',
        'optionalChaining',
        'classProperties',
      ],
    });

    return { ast, syntaxError: null };
  } catch (err) {
    const line = err.loc?.line || 1;
    const column = err.loc?.column || 0;
    const cleanMessage = err.message ? err.message.replace(/\s*\(\d+:\d+\)$/, '') : 'Syntax error in source code';

    return {
      ast: null,
      syntaxError: {
        line,
        column,
        message: cleanMessage,
      },
    };
  }
}
