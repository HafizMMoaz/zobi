import { alphabeticalSort, numericalSort } from './sorters';

const rows = [
  {
    name: 'Deathstar Lamp',
    category: 'Lamp',
    cost: 75.99,
  },
  {
    name: 'Desk Lamp',
    category: 'Lamp',
    cost: 15.99,
  },
  {
    name: 'Bedside Lamp',
    category: 'Lamp',
    cost: 15.99,
  },
  { name: 'Drafting Desk', category: 'Desk', cost: 125 },
  { name: 'Sit / Stand Desk', category: 'Desk', cost: 275.99 },
];

/**
 * NOTE:  Sorters for antd table use < 0, 0, > 0 for sorting
 * -1 or less means the first item comes after the second item
 * 0 means the items sort values is equivalent
 * 1 or greater means the first item comes before the second item
 */
test('alphabeticalSort sorts correctly', () => {
  // @ts-expect-error
  expect(alphabeticalSort('name', rows[0], rows[1])).toBeLessThan(0);
  // @ts-expect-error
  expect(alphabeticalSort('name', rows[1], rows[0])).toBeGreaterThan(0);
  // @ts-expect-error
  expect(alphabeticalSort('category', rows[1], rows[0])).toBe(0);
});

test('numericalSort sorts correctly', () => {
  // @ts-expect-error
  expect(numericalSort('cost', rows[1], rows[2])).toBe(0);
  // @ts-expect-error
  expect(numericalSort('cost', rows[1], rows[0])).toBeLessThan(0);
  // @ts-expect-error
  expect(numericalSort('cost', rows[4], rows[1])).toBeGreaterThan(0);
});

/**
 * We want to make sure our sorters do not throw runtime errors given bad inputs.
 * Runtime Errors in a sorter will cause a catastrophic React lifecycle error and produce white screen of death
 * In the case the sorter cannot perform the comparison it should return undefined and the next sort step will proceed without error
 */
test('alphabeticalSort bad inputs no errors', () => {
  // @ts-expect-error
  expect(alphabeticalSort('name', null, null)).toBe(undefined);
  // incorrect non-object values
  // @ts-expect-error
  expect(alphabeticalSort('name', 3, [])).toBe(undefined);
  // incorrect object values without specified key
  expect(alphabeticalSort('name', {}, {})).toBe(undefined);
  // Object as value for name when it should be a string
  expect(
    alphabeticalSort(
      'name',
      // @ts-expect-error
      { name: { title: 'the name attribute should not be an object' } },
      { name: 'Doug' },
    ),
  ).toBe(undefined);
});

test('numericalSort bad inputs no errors', () => {
  // @ts-expect-error
  expect(numericalSort('name', undefined, undefined)).toBeNaN();
  // @ts-expect-error
  expect(numericalSort('name', null, null)).toBeNaN();
  // incorrect non-object values
  // @ts-expect-error
  expect(numericalSort('name', 3, [])).toBeNaN();
  // incorrect object values without specified key
  expect(numericalSort('name', {}, {})).toBeNaN();
  // Object as value for name when it should be a string
  expect(
    numericalSort(
      'name',
      // @ts-expect-error
      { name: { title: 'the name attribute should not be an object' } },
      { name: 'Doug' },
    ),
  ).toBeNaN();
});
