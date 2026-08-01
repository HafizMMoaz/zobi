import { parseAxisBound } from '../../src/utils/controls';

describe('parseYAxisBound', () => {
  test('should return undefined for invalid values', () => {
    expect(parseAxisBound(null)).toBeUndefined();
    expect(parseAxisBound(undefined)).toBeUndefined();
    expect(parseAxisBound(NaN)).toBeUndefined();
    expect(parseAxisBound('abc')).toBeUndefined();
  });

  test('should return numeric value for valid values', () => {
    expect(parseAxisBound(0)).toEqual(0);
    expect(parseAxisBound('0')).toEqual(0);
    expect(parseAxisBound(1)).toEqual(1);
    expect(parseAxisBound('1')).toEqual(1);
    expect(parseAxisBound(10.1)).toEqual(10.1);
    expect(parseAxisBound('10.1')).toEqual(10.1);
  });
});
