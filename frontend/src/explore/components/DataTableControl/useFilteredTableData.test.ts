
import { renderHook } from '@testing-library/react';
import { useFilteredTableData } from '.';

const data = [
  { col01: 'some', col02: 'data' },
  { col01: 'any', col02: 'data' },
  { col01: 'some', col02: 'thing' },
  { col01: 'any', col02: 'things' },
];

test('Empty filter', () => {
  const hook = renderHook(() => useFilteredTableData('', data));
  expect(hook.result.current).toEqual(data);
});

test('Filter by the word "data"', () => {
  const hook = renderHook(() => useFilteredTableData('data', data));
  expect(hook.result.current).toEqual([
    { col01: 'some', col02: 'data' },
    { col01: 'any', col02: 'data' },
  ]);
});

test('Filter by the word "thing"', () => {
  const hook = renderHook(() => useFilteredTableData('thing', data));
  expect(hook.result.current).toEqual([
    { col01: 'some', col02: 'thing' },
    { col01: 'any', col02: 'things' },
  ]);
});

test('Filter by the word "any"', () => {
  const hook = renderHook(() => useFilteredTableData('any', data));
  expect(hook.result.current).toEqual([
    { col01: 'any', col02: 'data' },
    { col01: 'any', col02: 'things' },
  ]);
});
