import './shim';
// eslint-disable-next-line no-restricted-syntax -- whole React import is required for mocking React module in tests.
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { configure as configureTestingLibrary } from '@testing-library/react';
import { matchers } from '@emotion/jest';

configureTestingLibrary({
  testIdAttribute: 'data-test',
});

document.body.innerHTML = '<div id="app" data-bootstrap=""></div>';
expect.extend(matchers);

// Allow JSX tests to have React import readily available
global.React = React;

// Mock ace-builds globally for tests
jest.mock('ace-builds/src-min-noconflict/mode-handlebars', () => ({}));
jest.mock('ace-builds/src-min-noconflict/mode-css', () => ({}));
jest.mock('ace-builds/src-noconflict/theme-github', () => ({}));
jest.mock('ace-builds/src-noconflict/theme-monokai', () => ({}));
