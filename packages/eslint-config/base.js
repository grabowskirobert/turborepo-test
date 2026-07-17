import path from 'node:path';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import onlyWarn from 'eslint-plugin-only-warn';

const kebabCaseSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const legacyImportFixes = new Map([
  ['@/components', '@/presentation/components'],
  ['@/hooks', '@/presentation/hooks'],
  ['@/stores', '@/core/store'],
]);

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function getSourceLayer(filename) {
  const normalized = normalizePath(filename);
  const layerMatch = normalized.match(
    /(?:packages\/io-detector|apps\/io-detector-devtools-extension)\/src\/(domain|core|integration|presentation)(?:\/|$)/,
  );

  return layerMatch?.[1] ?? null;
}

function getImportLayer(importPath) {
  const aliasMatch = importPath.match(
    /^@\/(domain|core|integration|presentation)(?:\/|$)/,
  );
  if (aliasMatch) return aliasMatch[1];

  const relativeMatch = importPath.match(
    /(?:^|\/)\.\.\/(domain|core|integration|presentation)(?:\/|$)/,
  );
  if (relativeMatch) return relativeMatch[1];

  return null;
}

function getLegacyImportFix(importPath) {
  for (const [from, to] of legacyImportFixes) {
    if (importPath === from || importPath.startsWith(`${from}/`)) {
      return `${to}${importPath.slice(from.length)}`;
    }
  }

  return null;
}

function isForbiddenLayerImport(sourceLayer, importLayer) {
  if (!sourceLayer || !importLayer) return false;

  if (sourceLayer === 'domain') {
    return ['core', 'integration', 'presentation'].includes(importLayer);
  }

  if (sourceLayer === 'core') {
    return importLayer === 'presentation';
  }

  if (sourceLayer === 'integration') {
    return importLayer === 'presentation';
  }

  return false;
}

const filenameRulesPlugin = {
  rules: {
    'kebab-case': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require kebab-case filenames.',
        },
        messages: {
          invalidFilename:
            'Filename "{{ filename }}" must use kebab-case segments.',
        },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.filename ?? context.getFilename();

            if (!filename || filename === '<input>') return;

            const basename = path.basename(filename);
            const name = basename.startsWith('.')
              ? basename.slice(1)
              : basename;
            const stemParts = name.includes('.')
              ? name.split('.').slice(0, -1)
              : [name];
            const isKebabCase = stemParts.every(
              (part) => part === '' || kebabCaseSegment.test(part),
            );

            if (!isKebabCase) {
              context.report({
                node,
                messageId: 'invalidFilename',
                data: { filename: basename },
              });
            }
          },
        };
      },
    },
    'layer-boundaries': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent forbidden imports between architecture layers.',
        },
        messages: {
          forbiddenLayerImport:
            'Layer "{{ sourceLayer }}" must not import from "{{ importLayer }}".',
          legacyImport:
            'Use "{{ fixedImport }}" instead of legacy import "{{ importPath }}".',
        },
        fixable: 'code',
        schema: [],
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const importPath = node.source.value;
            if (typeof importPath !== 'string') return;

            const fixedImport = getLegacyImportFix(importPath);
            if (fixedImport) {
              context.report({
                node: node.source,
                messageId: 'legacyImport',
                data: { importPath, fixedImport },
                fix: (fixer) =>
                  fixer.replaceText(node.source, `'${fixedImport}'`),
              });
              return;
            }

            const sourceLayer = getSourceLayer(
              context.filename ?? context.getFilename(),
            );
            const importLayer = getImportLayer(importPath);

            if (isForbiddenLayerImport(sourceLayer, importLayer)) {
              context.report({
                node: node.source,
                messageId: 'forbiddenLayerImport',
                data: { sourceLayer, importLayer },
              });
            }
          },
        };
      },
    },
  },
};

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      filename: filenameRulesPlugin,
    },
    rules: {
      'filename/kebab-case': 'error',
      'filename/layer-boundaries': 'error',
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**'],
  },
];
