
import { rankedSearchCompare } from './rankedSearchCompare';

const searchSort = (search: string) => (a: string, b: string) =>
  rankedSearchCompare(a, b, search);

test('Sort exact match first', async () => {
  expect(['abc', 'bc', 'bcd', 'cbc'].sort(searchSort('bc'))).toEqual([
    'bc',
    'bcd',
    'abc',
    'cbc',
  ]);
});

test('Sort starts with first', async () => {
  expect(['her', 'Cher', 'Her', 'Hermon'].sort(searchSort('Her'))).toEqual([
    'Her',
    'Hermon',
    'her',
    'Cher',
  ]);
  expect(
    ['abc', 'ab', 'aaabc', 'bbabc', 'BBabc'].sort(searchSort('abc')),
  ).toEqual(['abc', 'aaabc', 'bbabc', 'BBabc', 'ab']);
});

test('Sort same case first', async () => {
  expect(['%f %B', '%F %b'].sort(searchSort('%F'))).toEqual(['%F %b', '%f %B']);
});

test('returns localeCompare result when no search term provided', () => {
  expect(rankedSearchCompare('banana', 'apple', '')).toBeGreaterThan(0);
  expect(rankedSearchCompare('apple', 'banana', '')).toBeLessThan(0);
});

test('handles empty string a', () => {
  const result = rankedSearchCompare('', 'hello', 'hello');
  expect(typeof result).toBe('number');
});

test('handles empty string b', () => {
  const result = rankedSearchCompare('hello', '', 'hello');
  expect(typeof result).toBe('number');
});

test('falls back to localeCompare when strings have no match relationship to search', () => {
  expect(rankedSearchCompare('abc', 'def', 'xyz')).toBeLessThan(0);
  expect(rankedSearchCompare('def', 'abc', 'xyz')).toBeGreaterThan(0);
});
