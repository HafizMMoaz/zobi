
import { renderHook } from '@testing-library/react';
import { useCellContentParser } from './useCellContentParser';

test('should return NULL for null cell data', () => {
  const { result } = renderHook(() =>
    useCellContentParser({ columnKeys: [], expandedColumns: [] }),
  );
  const parser = result.current;
  expect(parser({ cellData: null, columnKey: '' })).toBe('NULL');
});

test('should return truncated string for complex columns', () => {
  const { result } = renderHook(() =>
    useCellContentParser({
      columnKeys: ['a'],
      expandedColumns: ['a.b'],
    }),
  );
  const parser = result.current;

  expect(
    parser({
      cellData: 'this is a very long string',
      columnKey: 'a.b',
    }),
  ).toBe('this is a very long string');
  expect(
    parser({
      cellData: '["this is a very long string"]',
      columnKey: 'a',
    }),
  ).toBe('[…]');
  expect(
    parser({
      cellData: '{ "b": "this is a very long string" }',
      columnKey: 'a',
    }),
  ).toBe('{…}');
});
