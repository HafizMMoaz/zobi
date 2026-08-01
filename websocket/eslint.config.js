const typescriptEslintParser = require('@typescript-eslint/parser');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptEslint = require('typescript-eslint');
const lodashEslintPlugin = require('eslint-plugin-lodash');
const eslintConfigPrettier = require('eslint-config-prettier');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['*.min.js', 'node_modules', 'dist', 'coverage'],
    languageOptions: {
      parser: typescriptEslintParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      typescript: typescriptEslintPlugin,
      lodash: lodashEslintPlugin,
    },
    rules: {
      'lodash/import-scope': [2, 'member'],
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-require-imports': 0, // Re-enable once websocket is converted to ESM
    },
  },
];
