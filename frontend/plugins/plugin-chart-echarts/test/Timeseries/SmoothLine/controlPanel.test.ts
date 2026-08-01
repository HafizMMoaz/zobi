import { ControlPanelsContainerProps } from '@zobi-ui/chart-controls/types';
import { GenericDataType } from '@zobi/core/common';
import controlPanel from '../../../src/Timeseries/Regular/SmoothLine/controlPanel';

const config = controlPanel;

const getControl = (controlName: string) => {
  for (const section of config.controlPanelSections) {
    if (section && section.controlSetRows) {
      for (const row of section.controlSetRows) {
        for (const control of row) {
          if (
            typeof control === 'object' &&
            control !== null &&
            'name' in control &&
            control.name === controlName
          ) {
            return control;
          }
        }
      }
    }
  }

  return null;
};

const mockControls = (
  xAxisColumn: string | null,
  typeGeneric: GenericDataType | null,
): ControlPanelsContainerProps => {
  const columns =
    xAxisColumn && typeGeneric !== null
      ? [{ column_name: xAxisColumn, type_generic: typeGeneric }]
      : [];

  return {
    controls: {
      // @ts-expect-error
      x_axis: {
        value: xAxisColumn,
      },
      // @ts-expect-error
      datasource: {
        datasource: { columns },
      },
    },
  };
};

const timeFormatControl: any = getControl('x_axis_time_format');
const numberFormatControl: any = getControl('x_axis_number_format');

test('should include x_axis_time_format control', () => {
  expect(timeFormatControl).toBeDefined();
  expect(timeFormatControl.config.default).toBe('smart_date');
});

test('should include x_axis_number_format control', () => {
  expect(numberFormatControl).toBeDefined();
  expect(numberFormatControl.config.default).toBe('~g');
});

test('x_axis_number_format should be visible for numeric columns', () => {
  const visibilityFn = numberFormatControl?.config?.visibility;
  expect(visibilityFn(mockControls('year', GenericDataType.Numeric))).toBe(
    true,
  );
});

test('x_axis_number_format should be hidden for temporal columns', () => {
  const visibilityFn = numberFormatControl?.config?.visibility;
  expect(visibilityFn(mockControls('date', GenericDataType.Temporal))).toBe(
    false,
  );
});

test('x_axis_number_format should be hidden for string columns', () => {
  const visibilityFn = numberFormatControl?.config?.visibility;
  expect(visibilityFn(mockControls('name', GenericDataType.String))).toBe(
    false,
  );
});
