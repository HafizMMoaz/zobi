import { ColumnType } from './columnType';

test('ColumnType should have proper structure', () => {
  const mockColumn: ColumnType = {
    column_name: 'test_column',
    type: 'STRING',
  };

  expect(mockColumn.column_name).toBe('test_column');
  expect(mockColumn.type).toBe('STRING');
});

test('ColumnType should allow optional type field', () => {
  const mockColumn: ColumnType = {
    column_name: 'test_column',
  };

  expect(mockColumn.column_name).toBe('test_column');
  expect(mockColumn.type).toBeUndefined();
});

test('ColumnType should work with different type values', () => {
  const stringColumn: ColumnType = {
    column_name: 'str_col',
    type: 'STRING',
  };

  const numericColumn: ColumnType = {
    column_name: 'num_col',
    type: 'NUMERIC',
  };

  expect(stringColumn.type).toBe('STRING');
  expect(numericColumn.type).toBe('NUMERIC');
});
