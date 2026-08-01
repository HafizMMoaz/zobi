import isBlank from './isBlank';

test('returns true for null', () => {
  expect(isBlank(null)).toBe(true);
});

test('returns true for undefined', () => {
  expect(isBlank(undefined)).toBe(true);
});

test('returns true for empty string', () => {
  expect(isBlank('')).toBe(true);
});

test('returns true for whitespace-only strings', () => {
  expect(isBlank(' ')).toBe(true);
  expect(isBlank('  ')).toBe(true);
  expect(isBlank('\t')).toBe(true);
  expect(isBlank('\n')).toBe(true);
  expect(isBlank(' \t\n ')).toBe(true);
});

test('returns false for non-empty strings', () => {
  expect(isBlank('hello')).toBe(false);
  expect(isBlank(' hello ')).toBe(false);
});

test('returns true for NaN', () => {
  expect(isBlank(NaN)).toBe(true);
});

test('returns false for numbers', () => {
  expect(isBlank(0)).toBe(false);
  expect(isBlank(50)).toBe(false);
  expect(isBlank(-1)).toBe(false);
});

test('returns false for booleans', () => {
  expect(isBlank(true)).toBe(false);
  expect(isBlank(false)).toBe(false);
});
