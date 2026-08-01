const packageConfig = require('./package');

module.exports = {
  sourceMaps: true,
  sourceType: 'module',
  retainLines: true,
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
        loose: true,
        modules: false,
        shippedProposals: true,
        targets: packageConfig.browserslist,
      },
    ],
    [
      '@babel/preset-react',
      {
        development: process.env.BABEL_ENV === 'development',
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    'lodash',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-export-namespace-from',
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-optional-chaining', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-nullish-coalescing-operator', { loose: true }],
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    [
      '@emotion/babel-plugin',
      {
        autoLabel: 'dev-only',
        labelFormat: '[local]',
      },
    ],
  ],
  env: {
    // Setup a different config for tests as they run in node instead of a browser
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'usage',
            corejs: 3,
            loose: true,
            shippedProposals: true,
            modules: 'auto',
            targets: { node: 'current' },
          },
        ],
        [
          '@babel/preset-react',
          {
            development: process.env.BABEL_ENV === 'development',
            runtime: 'automatic',
          },
        ],
        '@babel/preset-typescript',
      ],
      plugins: [
        'babel-plugin-dynamic-import-node',
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-transform-export-namespace-from',
      ],
    },
    // build instrumented code for testing code coverage with Cypress
    instrumented: {
      plugins: [
        [
          'istanbul',
          {
            exclude: ['plugins/**/*', 'packages/**/*'],
          },
        ],
      ],
    },
    production: {
      plugins: [
        [
          'babel-plugin-jsx-remove-data-test-id',
          {
            attributes: 'data-test',
          },
        ],
      ],
    },
    testableProduction: {
      plugins: [],
    },
  },
  overrides: [
    {
      test: './plugins/handlebars/node_modules/just-handlebars-helpers/*',
      sourceType: 'unambiguous',
    },
  ],
};
