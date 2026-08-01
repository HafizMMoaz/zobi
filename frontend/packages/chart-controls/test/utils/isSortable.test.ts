import { ControlStateMapping } from '@zobi.dev/chart-controls';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { isSortable } from '../../src/utils/isSortable';

const controls: ControlStateMapping = {
  datasource: {
    datasource: {
      columns: [
        { column_name: 'a', type_generic: GenericDataType.String },
        { column_name: 'b', type_generic: GenericDataType.Numeric },
        { column_name: 'c', type_generic: GenericDataType.Boolean },
      ],
    },
    type: 'Select',
  },
};

test('should return true if the column is forced to be categorical', () => {
  const c: ControlStateMapping = {
    ...controls,
    x_axis: { value: 'b', type: 'Select' },
    xAxisForceCategorical: { value: true, type: 'Checkbox' },
  };
  expect(isSortable(c)).toBe(true);
});

test('should return true if the column is a custom SQL column', () => {
  const c: ControlStateMapping = {
    ...controls,
    x_axis: {
      value: { label: 'custom_sql', sqlExpression: 'MAX(ID)' },
      type: 'Select',
    },
  };
  expect(isSortable(c)).toBe(true);
});

test('should return true if the column type is String or Boolean', () => {
  const c: ControlStateMapping = {
    ...controls,
    x_axis: { value: 'c', type: 'Checkbox' },
  };
  expect(isSortable(c)).toBe(true);
});

test('should return false if none of the conditions are met', () => {
  const c: ControlStateMapping = {
    ...controls,
    x_axis: { value: 'b', type: 'Input' },
  };
  expect(isSortable(c)).toBe(false);
});
