import { legacyValidateNumber } from '@zobi.dev/core';
import './setup';

describe('legacyValidateNumber()', () => {
  test('returns the warning message if invalid', () => {
    expect(legacyValidateNumber('abc')).toBeTruthy();
  });
  test('returns false if the input is valid', () => {
    // zobi seems to operate on this incorrect behavior at the moment
    expect(legacyValidateNumber(NaN)).toBeFalsy();
    expect(legacyValidateNumber(Infinity)).toBeFalsy();
    expect(legacyValidateNumber(undefined)).toBeFalsy();
    expect(legacyValidateNumber(null)).toBeFalsy();
    expect(legacyValidateNumber('')).toBeFalsy();

    expect(legacyValidateNumber(0)).toBeFalsy();
    expect(legacyValidateNumber(10.1)).toBeFalsy();
    expect(legacyValidateNumber(10)).toBeFalsy();
    expect(legacyValidateNumber('10')).toBeFalsy();
  });
});
