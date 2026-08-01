

import { validateNumber } from '@zobi.dev/core';
import './setup';

describe('validateNumber()', () => {
  test('returns the warning message if invalid', () => {
    expect(validateNumber(NaN)).toBeTruthy();
    expect(validateNumber(Infinity)).toBeTruthy();
    expect(validateNumber(undefined)).toBeTruthy();
    expect(validateNumber(null)).toBeTruthy();
    expect(validateNumber('abc')).toBeTruthy();
    expect(validateNumber('')).toBeTruthy();
  });
  test('returns false if the input is valid', () => {
    expect(validateNumber(0)).toBeFalsy();
    expect(validateNumber(10.1)).toBeFalsy();
    expect(validateNumber(10)).toBeFalsy();
    expect(validateNumber('10')).toBeFalsy();
  });
});
