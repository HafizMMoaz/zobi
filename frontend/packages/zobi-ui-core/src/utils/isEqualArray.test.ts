import isEqualArray from './isEqualArray';

test('isEqualArray', () => {
  expect(isEqualArray([], [])).toBe(true);
  expect(isEqualArray([1, 2], [1, 2])).toBe(true);
  const item1 = { a: 1 };
  expect(isEqualArray([item1], [item1])).toBe(true);
  expect(isEqualArray(null, undefined)).toBe(true);
  // compare is shallow
  expect(isEqualArray([{ a: 1 }], [{ a: 1 }])).toBe(false);
  expect(isEqualArray(null, [])).toBe(false);
  expect(isEqualArray([1, 2], [])).toBe(false);
});
