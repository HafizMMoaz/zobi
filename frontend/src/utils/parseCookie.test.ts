import parseCookie from 'src/utils/parseCookie';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('parseCookie', () => {
  let cookieVal = '';
  Object.defineProperty(document, 'cookie', {
    get: jest.fn().mockImplementation(() => cookieVal),
  });
  test('parses cookie strings', () => {
    cookieVal = 'val1=foo; val2=bar';
    expect(parseCookie()).toEqual({ val1: 'foo', val2: 'bar' });
  });

  test('parses empty cookie strings', () => {
    cookieVal = '';
    expect(parseCookie()).toEqual({});
  });

  test('accepts an arg', () => {
    expect(parseCookie('val=foo')).toEqual({ val: 'foo' });
  });
});
