import JSDOMEnvironment from 'jest-environment-jsdom';

// jest-environment-jsdom 30 bundles jsdom 26, which marks window.location as
// [LegacyUnforgeable] (configurable: false). jest 30's spyOn now strictly
// checks the configurable flag and throws when it's false, breaking every test
// that uses jest.spyOn(window, 'location', 'get').
//
// We intercept Object.defineProperties at module-load time (before any JSDOM
// instance is created). The interceptor makes window.location configurable
// every time jsdom creates a new Window, restoring the ability to spy on it.
// This file is only required by Jest in the test environment so the
// monkey-patch is safe.
const _originalDefineProperties = Object.defineProperties.bind(Object);
(Object as any).defineProperties = function (
  obj: object,
  props: PropertyDescriptorMap,
) {
  if (
    props !== null &&
    typeof props === 'object' &&
    Object.prototype.hasOwnProperty.call(props, 'location') &&
    (props as any).location?.configurable === false
  ) {
    // Allow jest.spyOn(window, 'location', 'get') to work in tests by making
    // the property configurable. This deviates from the browser spec's
    // [LegacyUnforgeable] requirement but is acceptable in a test environment.
    props = {
      ...props,
      location: { ...(props as any).location, configurable: true },
    };
  }
  return _originalDefineProperties(obj, props);
};

// https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // FIXME https://github.com/jsdom/jsdom/issues/1724
    this.global.fetch = fetch;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.AbortSignal = AbortSignal;
    this.global.AbortController = AbortController;
    this.global.ReadableStream = ReadableStream;
    this.global.TransformStream = TransformStream;

    // Mock MessageChannel to prevent hanging Jest tests with rc-overflow@1.4.1
    // Forces rc-overflow to use requestAnimationFrame fallback instead
    // Can be removed when rc-overflow properly cleans up MessagePorts in test environments
    // See: https://github.com/HafizMMoaz/zobi/pull/34871
    this.global.MessageChannel = undefined as any;
    this.global.MessagePort = undefined as any;
  }
}
