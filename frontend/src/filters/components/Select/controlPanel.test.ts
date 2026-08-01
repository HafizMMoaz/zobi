import { GenericDataType } from '@zobi.dev/extension-api/common';
import { getOperatorTypeChoices, isStringOperatorColumn } from './controlPanel';
import { SelectFilterOperatorType } from './types';

test('getOperatorTypeChoices only returns exact match for non-string columns', () => {
  expect(getOperatorTypeChoices(false)).toEqual([
    [SelectFilterOperatorType.Exact, 'Exact match (IN)'],
  ]);
});

test('isStringOperatorColumn returns false for numeric selected columns', () => {
  expect(
    isStringOperatorColumn('num_col', [
      { column_name: 'num_col', type_generic: GenericDataType.Numeric },
    ]),
  ).toBe(false);
});

test('isStringOperatorColumn returns true for string selected columns', () => {
  expect(
    isStringOperatorColumn('name', [
      { column_name: 'name', type_generic: GenericDataType.String },
    ]),
  ).toBe(true);
});
