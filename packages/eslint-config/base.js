import path from 'node:path';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import onlyWarn from 'eslint-plugin-only-warn';

const kebabCaseSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
