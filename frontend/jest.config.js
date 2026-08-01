// timezone for unit tests
process.env.TZ = 'America/New_York';
module.exports = {
  testRegex:
    '\\/frontend\\/(spec|src|plugins|packages|tools)\\/.*(_spec|\\.test)\\.[jt]sx?$',
  moduleNameMapper: {
    '\\.(css|less|geojson)$': '<rootDir>/spec/__mocks__/mockExportObject.js',
    '\\.(gif|ttf|eot|png|jpg)$': '<rootDir>/spec/__mocks__/mockExportString.js',
    '\\.svg$': '<rootDir>/spec/__mocks__/svgrMock.tsx',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^spec/(.*)$': '<rootDir>/spec/$1',
    // mapping plugins of zobi-ui to source code
    '^@zobi-ui/([^/]+)/(.*)$':
      '<rootDir>/node_modules/@zobi-ui/$1/src/$2',
    '^@zobi-ui/([^/]+)$': '<rootDir>/node_modules/@zobi-ui/$1/src',
    // mapping @zobi/core to local package
    '^@zobi/core$': '<rootDir>/packages/core/src',
    '^@zobi/core/(.*)$': '<rootDir>/packages/core/src/$1',
  },
  testEnvironment: '<rootDir>/spec/helpers/jsDomWithFetchAPI.ts',
  modulePathIgnorePatterns: [
    '<rootDir>/packages/generator-zobi',
    '<rootDir>/packages/.*/esm',
    '<rootDir>/packages/.*/lib',
    '<rootDir>/plugins/.*/esm',
    '<rootDir>/plugins/.*/lib',
    // Ignore build artifacts that contain duplicate package.json or mock files
    '<rootDir>/storybook-static',
    // Ignore duplicate __mocks__ at package root level (e.g., packages/zobi-ui-core/__mocks__)
    // but not test __mocks__ directories (e.g., packages/zobi-ui-core/test/__mocks/)
    '<rootDir>/packages/[^/]+/__mocks__',
  ],
  setupFilesAfterEnv: ['<rootDir>/spec/helpers/setup.ts'],
  snapshotSerializers: ['@emotion/jest/serializer'],
  testEnvironmentOptions: {
    globalsCleanup: true,
    url: 'http://localhost',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '{packages,plugins}/**/src/**/*.{js,jsx,ts,tsx}',
    '!**/*.stories.*',
  ],
  coverageDirectory: '<rootDir>/coverage/',
  coveragePathIgnorePatterns: [
    'coverage/',
    'node_modules/',
    'public/',
    'tmp/',
    'dist/',
  ],
  coverageReporters: ['lcov', 'json-summary', 'html', 'text'],
  transformIgnorePatterns: [
    'node_modules/(?!d3-(array|interpolate|color|time|scale|time-format|format)|internmap|@mapbox/tiny-sdf|remark-gfm|(?!@ngrx|(?!deck.gl)|d3-scale)|markdown-table|micromark-*.|decode-named-character-reference|character-entities|mdast-util-*.|unist-util-*.|ccount|escape-string-regexp|nanoid|uuid|@rjsf/*.|echarts|zrender|fetch-mock|pretty-ms|parse-ms|ol|@babel/runtime|@emotion|cheerio|cheerio/lib|parse5|dom-serializer|entities|htmlparser2|rehype-sanitize|hast-util-sanitize|unified|unist-.*|hast-.*|rehype-.*|remark-.*|mdast-.*|micromark-.*|parse-entities|property-information|space-separated-tokens|comma-separated-tokens|bail|devlop|zwitch|longest-streak|geostyler|geostyler-.*|(?!geostyler)lodash|react-error-boundary|react-json-tree|react-base16-styling|lodash-es|rbush|quickselect|react-diff-viewer-continued)',
  ],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    __DEV__: true,
    caches: true,
  },
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
      },
    ],
  ],
  testTimeout: 20000,
};
