import { getURIDirectory } from '.';

test('Cases in which the "explore_json" will be returned', () => {
  ['full', 'json', 'csv', 'query', 'results', 'samples'].forEach(name => {
    expect(getURIDirectory(name)).toBe('/zobi/explore_json/');
  });
});

test('Cases in which the "explore" will be returned', () => {
  expect(getURIDirectory('any-string')).toBe('/explore/');
  expect(getURIDirectory()).toBe('/explore/');
});
