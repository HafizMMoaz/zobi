

import { validateInteger } from '@zobi-ui/core';
import './setup';

describe('validateInteger()', () => {
  test('returns the warning message if invalid', () => {
    expect(validateInteger(10.1)).toBeTruthy();
    expect(validateInteger(NaN)).toBeTruthy();
    expect(validateInteger(Infinity)).toBeTruthy();
    expect(validateInteger(undefined)).toBeTruthy();
    expect(validateInteger(null)).toBeTruthy();
    expect(validateInteger('abc')).toBeTruthy();
    expect(validateInteger('')).toBeTruthy();
  });
  test('returns false if the input is valid', () => {
    expect(validateInteger(0)).toBeFalsy();
    expect(validateInteger(10)).toBeFalsy();
    expect(validateInteger('10')).toBeFalsy();
  });
});
