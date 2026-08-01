
import type { LabeledValue as AntdLabeledValue } from 'antd/es/select';
import { DEFAULT_SORT_COMPARATOR } from './constants';

test('DEFAULT_SORT_COMPARATOR sorts by label text when both labels are strings', () => {
  const a = { value: 'b', label: 'banana' } as AntdLabeledValue;
  const b = { value: 'a', label: 'apple' } as AntdLabeledValue;
  expect(DEFAULT_SORT_COMPARATOR(a, b)).toBeGreaterThan(0);
  expect(DEFAULT_SORT_COMPARATOR(b, a)).toBeLessThan(0);
});

test('DEFAULT_SORT_COMPARATOR sorts by value text when labels are not strings', () => {
  const a = { value: 'b' } as AntdLabeledValue;
  const b = { value: 'a' } as AntdLabeledValue;
  expect(DEFAULT_SORT_COMPARATOR(a, b)).toBeGreaterThan(0);
  expect(DEFAULT_SORT_COMPARATOR(b, a)).toBeLessThan(0);
});

test('DEFAULT_SORT_COMPARATOR returns numeric difference when values are numbers', () => {
  const a = { value: 3 } as unknown as AntdLabeledValue;
  const b = { value: 1 } as unknown as AntdLabeledValue;
  expect(DEFAULT_SORT_COMPARATOR(a, b)).toBe(2);
  expect(DEFAULT_SORT_COMPARATOR(b, a)).toBe(-2);
});

test('DEFAULT_SORT_COMPARATOR uses rankedSearchCompare when search is provided', () => {
  const a = { value: 'abc', label: 'abc' } as AntdLabeledValue;
  const b = { value: 'bc', label: 'bc' } as AntdLabeledValue;
  // 'bc' is an exact match to search 'bc', so it should sort first (lower index = negative diff)
  expect(DEFAULT_SORT_COMPARATOR(a, b, 'bc')).toBeGreaterThan(0);
});
