import { ensureIsInt } from '@zobi.dev/core';

describe('ensureIsInt', () => {
  test('handle inputs correctly', () => {
    expect(ensureIsInt(undefined, 0)).toEqual(0);
    expect(ensureIsInt('abc', 1)).toEqual(1);
    expect(ensureIsInt(undefined)).toEqual(NaN);
    expect(ensureIsInt('abc')).toEqual(NaN);
    expect(ensureIsInt('12.5')).toEqual(12);
    expect(ensureIsInt(12)).toEqual(12);
    expect(ensureIsInt(12, 0)).toEqual(12);
  });
});
