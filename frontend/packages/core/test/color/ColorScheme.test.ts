import ColorScheme from '../../src/color/ColorScheme';

describe('ColorScheme', () => {
  describe('new ColorScheme()', () => {
    test('returns an instance of ColorScheme', () => {
      const scheme = new ColorScheme({ id: 'test', colors: ['red', 'blue'] });
      expect(scheme).toBeInstanceOf(ColorScheme);
    });
  });
});
