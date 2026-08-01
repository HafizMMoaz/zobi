import { isFrontendRoute, routes } from './routes';

jest.mock('src/pages/Home', () => () => <div data-test="mock-home" />);

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('isFrontendRoute', () => {
  test('returns true if a route matches', () => {
    routes.forEach(r => {
      expect(isFrontendRoute(r.path)).toBe(true);
    });
  });

  test('returns false if a route does not match', () => {
    expect(isFrontendRoute('/nonexistent/path/')).toBe(false);
  });
});
