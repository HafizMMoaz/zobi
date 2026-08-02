import { validateNonEmpty } from '@zobi.dev/core';
import './setup';

describe('validateNonEmpty()', () => {
  test('returns the warning message if invalid', () => {
    expect(validateNonEmpty([])).toBeTruthy();
    expect(validateNonEmpty(undefined)).toBeTruthy();
    expect(validateNonEmpty(null)).toBeTruthy();
    expect(validateNonEmpty('')).toBeTruthy();
  });
  test('returns false if the input is valid', () => {
    expect(validateNonEmpty(0)).toBeFalsy();
    expect(validateNonEmpty(10)).toBeFalsy();
    expect(validateNonEmpty('abc')).toBeFalsy();
  });
});
