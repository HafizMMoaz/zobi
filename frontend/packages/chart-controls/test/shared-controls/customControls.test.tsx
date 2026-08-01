
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { xAxisForceCategoricalControl } from '../../src/shared-controls/customControls';
import { checkColumnType } from '../../src/utils/checkColumnType';
import type { ControlState } from '@zobi.dev/chart-controls';

jest.mock('../../src/utils/checkColumnType');
jest.mock('@zobi.dev/core', () => ({
  ...jest.requireActual('@zobi.dev/core'),
  getColumnLabel: jest.fn((col: any) => col),
}));

test('xAxisForceCategoricalControl should not treat temporal columns as categorical when x_axis_sort exists', () => {
  const mockCheckColumnType = jest.mocked(checkColumnType);

  mockCheckColumnType.mockReturnValue(false); // temporal column (not numeric)

  const control: ControlState = { value: false, type: 'CheckboxControl' };
  const state = {
    form_data: { x_axis_sort: 'asc' },
    controls: {
      x_axis: { value: 'date_column' },
      datasource: { datasource: {} },
    },
  };

  const result = xAxisForceCategoricalControl.config.initialValue!(
    control,
    state as any,
  );

  // Verify: should return control value (false) for non-numeric columns
  expect(result).toBe(false);
  expect(mockCheckColumnType).toHaveBeenCalledWith('date_column', {}, [
    GenericDataType.Numeric,
  ]);

  mockCheckColumnType.mockClear();
});
