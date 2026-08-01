

import { validateMaxValue } from '@zobi-ui/core';
import './setup';

test('validateMaxValue returns the warning message if invalid', () => {
  expect(validateMaxValue(10.1, 10)).toBeTruthy();
  expect(validateMaxValue(1, 0)).toBeTruthy();
  expect(validateMaxValue('2', 1)).toBeTruthy();
});

test('validateMaxValue returns false if the input is valid', () => {
  expect(validateMaxValue(0, 1)).toBeFalsy();
  expect(validateMaxValue(10, 10)).toBeFalsy();
  expect(validateMaxValue(undefined, 1)).toBeFalsy();
  expect(validateMaxValue(NaN, NaN)).toBeFalsy();
  expect(validateMaxValue(null, 1)).toBeFalsy();
  expect(validateMaxValue('1', 1)).toBeFalsy();
  expect(validateMaxValue('a', 1)).toBeFalsy();
});
