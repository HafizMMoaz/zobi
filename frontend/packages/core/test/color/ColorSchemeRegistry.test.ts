import ColorSchemeRegistry from '../../src/color/ColorSchemeRegistry';
import schemes from '../../src/color/colorSchemes/categorical/d3';
import CategoricalScheme from '../../src/color/CategoricalScheme';

describe('ColorSchemeRegistry', () => {
  test('exists', () => {
    expect(ColorSchemeRegistry).toBeDefined();
    expect(ColorSchemeRegistry).toBeInstanceOf(Function);
  });
  test('returns undefined', () => {
    const registry = new ColorSchemeRegistry();
    expect(registry.get('something')).toBeUndefined();
  });
  test('returns default', () => {
    const registry = new ColorSchemeRegistry();
    registry.registerValue('ZOBI_DEFAULT', schemes[0]);
    expect(registry.get('something')).toBeInstanceOf(CategoricalScheme);
  });
  test('returns undefined in strict mode', () => {
    const registry = new ColorSchemeRegistry();
    registry.registerValue('ZOBI_DEFAULT', schemes[0]);
    expect(registry.get('something', true)).toBeUndefined();
  });
});
