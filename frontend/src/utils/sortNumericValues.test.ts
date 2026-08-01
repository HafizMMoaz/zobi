import sortNumericValues from './sortNumericValues';

test('should always sort null and NaNs to bottom', () => {
  expect([null, 1, 2, '1', '5', NaN].sort(sortNumericValues)).toEqual([
    1,
    '1',
    2,
    '5',
    NaN,
    null,
  ]);
  expect(
    [null, 1, 2, '1', '5', NaN].sort((a, b) =>
      sortNumericValues(a, b, { descending: true }),
    ),
  ).toEqual(['5', 2, 1, '1', NaN, null]);
});

test('should treat null and NaN as smallest numbers', () => {
  expect(
    [null, 1, 2, '1', '5', NaN].sort((a, b) =>
      sortNumericValues(a, b, { nanTreatment: 'asSmallest' }),
    ),
  ).toEqual([null, NaN, 1, '1', 2, '5']);
  expect(
    [null, 1, 2, '1', '5', NaN].sort((a, b) =>
      sortNumericValues(a, b, { nanTreatment: 'asSmallest', descending: true }),
    ),
  ).toEqual(['5', 2, 1, '1', NaN, null]);
});

test('should treat null and NaN as largest numbers', () => {
  expect(
    [null, 1, 2, '1', '5', NaN].sort((a, b) =>
      sortNumericValues(a, b, { nanTreatment: 'asLargest' }),
    ),
  ).toEqual([1, '1', 2, '5', NaN, null]);
  expect(
    [null, 1, 2, '1', '5', NaN].sort((a, b) =>
      sortNumericValues(a, b, { nanTreatment: 'asLargest', descending: true }),
    ),
  ).toEqual([null, NaN, '5', 2, 1, '1']);
});
