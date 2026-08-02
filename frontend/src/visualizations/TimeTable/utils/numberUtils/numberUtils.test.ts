import { parseToNumber } from './numberUtils';

test('should handle numeric values', () => {
  expect(parseToNumber(123)).toBe(123);
  expect(parseToNumber(45.67)).toBe(45.67);
  expect(parseToNumber(0)).toBe(0);
  expect(parseToNumber(-123)).toBe(-123);
});

test('should handle string values', () => {
  expect(parseToNumber('123')).toBe(123);
  expect(parseToNumber('45.67')).toBe(45.67);
  expect(parseToNumber('0')).toBe(0);
  expect(parseToNumber('-123')).toBe(-123);
});

test('should handle null and undefined values', () => {
  expect(parseToNumber(null)).toBe(0);
  expect(parseToNumber(undefined)).toBe(0);
});

test('should handle invalid string values', () => {
  expect(parseToNumber('not a number')).toBe(0);
  expect(parseToNumber('abc123')).toBe(0);
  expect(parseToNumber('')).toBe(0);
});
