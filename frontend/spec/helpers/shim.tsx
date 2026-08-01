import { AriaAttributes } from 'react';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import jQuery from 'jquery';
// https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
// in order to mock modules in test case, so avoid absolute import module
import { configure as configureTranslation } from '@zobi/core/translation';
import fetchMock from 'fetch-mock';
import { Worker } from './Worker';
import { IntersectionObserver } from './IntersectionObserver';
import { ResizeObserver } from './ResizeObserver';
import setupZobiClient from './setupZobiClient';
import CacheStorage from './CacheStorage';
import { TextEncoder, TextDecoder } from 'util';

const exposedProperties = ['window', 'navigator', 'document'];

const { defaultView } = document;
if (defaultView != null) {
  Object.keys(defaultView).forEach(property => {
    if (typeof global[property as keyof typeof global] === 'undefined') {
      exposedProperties.push(property);
      // @ts-ignore due to string-type index signature doesn't apply for `typeof globalThis`.
      global[property] = defaultView[property as keyof typeof defaultView];
    }
  });
}

fetchMock.mockGlobal();
fetchMock.config.allowRelativeUrls = true;

const g = global as any;
g.window ??= Object.create(window);
g.window.location ??= { href: 'about:blank' };
g.window.performance ??= { now: () => new Date().getTime() };
g.window.Worker ??= Worker;
g.window.IntersectionObserver ??= IntersectionObserver;
g.window.ResizeObserver ??= ResizeObserver;
g.window.featureFlags ??= {};
g.URL.createObjectURL ??= () => '';
g.caches = new CacheStorage();

// Add shims for TextEncoder and TextDecoder after upgrading jspdf to v3.0.2+
// Source: https://github.com/parallax/jsPDF/issues/3882
g.TextDecoder = TextDecoder;
g.TextEncoder = TextEncoder;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

g.$ = jQuery(g.window);

configureTranslation();
setupZobiClient();

// The useTabId hook depends on BroadcastChannel. Jest has a memory leak problem when
// dealing with native modules. See https://chanind.github.io/javascript/2019/10/12/jest-tests-memory-leak.html
// and https://github.com/facebook/jest/issues/6814 for more information.
jest.mock('src/hooks/useTabId', () => ({
  useTabId: () => 1,
}));

// Check https://github.com/remarkjs/react-markdown/issues/635
jest.mock('react-markdown', () => (props: any) => <>{props.children}</>);
jest.mock('rehype-sanitize', () => () => jest.fn());
jest.mock('rehype-raw', () => () => jest.fn());

// Mocks the Icon component due to its async nature
// Tests should override this when needed
jest.mock('@zobi-ui/core/components/Icons/AsyncIcon', () => ({
  __esModule: true,
  default: ({
    fileName,
    role,
    'aria-label': ariaLabel,
    onClick,
    ...rest
  }: {
    fileName: string;
    role?: string;
    'aria-label'?: AriaAttributes['aria-label'];
    onClick?: () => void;
  }) => {
    // Simple mock that provides the essential attributes for testing
    const label = ariaLabel || fileName?.replace(/_/g, '-').toLowerCase() || '';
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <span
        role={role || (onClick ? 'button' : 'img')}
        aria-label={label}
        data-test={label}
        onClick={onClick}
        {...rest}
      />
    );
  },
  StyledIcon: ({
    component: Component,
    role,
    'aria-label': ariaLabel,
    ...rest
  }: {
    component: React.ComponentType<any>;
    role: string;
    'aria-label': AriaAttributes['aria-label'];
  }) => (
    <Component
      role={role ?? 'img'}
      alt={ariaLabel}
      aria-label={ariaLabel}
      {...rest}
    />
  ),
}));

process.env.WEBPACK_MODE = 'test';
