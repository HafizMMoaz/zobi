import { ChartProps, SMART_DATE_ID } from '@zobi.dev/core';
import transformProps from '../../../src/Timeseries/transformProps';
import { DEFAULT_FORM_DATA } from '../../../src/Timeseries/constants';
import {
  EchartsTimeseriesSeriesType,
  EchartsTimeseriesFormData,
  EchartsTimeseriesChartProps,
} from '../../../src/Timeseries/types';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import {
  D3_FORMAT_OPTIONS,
  D3_TIME_FORMAT_OPTIONS,
} from '@zobi.dev/chart-controls';
import { zobiTheme } from '@zobi.dev/extension-api/theme';

describe('Scatter Chart X-axis Time Formatting', () => {
  const baseFormData: EchartsTimeseriesFormData = {
    ...DEFAULT_FORM_DATA,
    colorScheme: 'zobiColors',
    datasource: '1__table',
    granularity_sqla: '__timestamp',
    metric: ['column 1'],
    groupby: [],
    viz_type: 'echarts_timeseries_scatter',
    seriesType: EchartsTimeseriesSeriesType.Scatter,
  };

  const timeseriesData = [
    {
      data: [
        { column_1: 0.72099, __timestamp: 1609459200000 },
        { column_1: 0.77954, __timestamp: 1612137600000 },
        { column_1: 2.83434, __timestamp: 1614556800000 },
      ],
      colnames: ['column_1', '__timestamp'],
      coltypes: [GenericDataType.Numeric, GenericDataType.Temporal],
    },
  ];

  const baseChartPropsConfig = {
    width: 800,
    height: 600,
    queriesData: timeseriesData,
    theme: zobiTheme,
  };

  test('xAxisTimeFormat has no default formatter', () => {
    const chartProps = new ChartProps({
      ...baseChartPropsConfig,
      formData: baseFormData,
    });

    const transformedProps = transformProps(
      chartProps as EchartsTimeseriesChartProps,
    );

    expect(transformedProps.echartOptions.xAxis).toHaveProperty('axisLabel');
    const xAxis = transformedProps.echartOptions.xAxis as any;
    expect(xAxis.axisLabel).toHaveProperty('formatter');
    expect(typeof xAxis.axisLabel.formatter).toBe('function');
  });

  test.each(D3_TIME_FORMAT_OPTIONS.map(([id]) => id))(
    'should handle %s format',
    format => {
      const chartProps = new ChartProps({
        ...baseChartPropsConfig,
        formData: {
          ...baseFormData,
          xAxisTimeFormat: format,
        },
      });

      const transformedProps = transformProps(
        chartProps as EchartsTimeseriesChartProps,
      );

      const xAxis = transformedProps.echartOptions.xAxis as any;
      expect(xAxis.axisLabel).toHaveProperty('formatter');
      expect(typeof xAxis.axisLabel.formatter).toBe('function');
      if (format !== SMART_DATE_ID) {
        expect(xAxis.axisLabel.formatter.id).toBe(format);
      }
    },
  );
});

describe('Scatter Chart X-axis Number Formatting', () => {
  const baseFormData: EchartsTimeseriesFormData = {
    ...DEFAULT_FORM_DATA,
    colorScheme: 'zobiColors',
    datasource: '1__table',
    metric: ['column_1'],
    x_axis: 'column_2',
    groupby: [],
    viz_type: 'echarts_timeseries_scatter',
    seriesType: EchartsTimeseriesSeriesType.Scatter,
  };

  const timeseriesData = [
    {
      data: [
        { column_1: 0.72099, column_2: 3.01699 },
        { column_1: 0.77954, column_2: 3.44802 },
        { column_1: 2.83434, column_2: 3.58095 },
      ],
      colnames: ['column_1', 'column_2'],
      coltypes: [GenericDataType.Numeric, GenericDataType.Numeric],
    },
  ];

  const baseChartPropsConfig = {
    width: 800,
    height: 600,
    queriesData: timeseriesData,
    theme: zobiTheme,
  };

  test('should use SMART_NUMBER as default xAxisNumberFormat', () => {
    const chartProps = new ChartProps({
      ...baseChartPropsConfig,
      formData: baseFormData,
    });

    const transformedProps = transformProps(
      chartProps as EchartsTimeseriesChartProps,
    );

    expect(transformedProps.echartOptions.xAxis).toHaveProperty('axisLabel');
    const xAxis = transformedProps.echartOptions.xAxis as any;
    expect(xAxis.axisLabel).toHaveProperty('formatter');
    expect(typeof xAxis.axisLabel.formatter).toBe('function');
    expect(xAxis.axisLabel.formatter.id).toBe('SMART_NUMBER');
  });

  test.each(D3_FORMAT_OPTIONS.map(([id]) => id))(
    'should handle %s format',
    format => {
      const chartProps = new ChartProps({
        ...baseChartPropsConfig,
        formData: {
          ...baseFormData,
          xAxisNumberFormat: format,
        },
      });

      const transformedProps = transformProps(
        chartProps as EchartsTimeseriesChartProps,
      );

      expect(transformedProps.echartOptions.xAxis).toHaveProperty('axisLabel');
      const xAxis = transformedProps.echartOptions.xAxis as any;
      expect(xAxis.axisLabel).toHaveProperty('formatter');
      expect(typeof xAxis.axisLabel.formatter).toBe('function');
      expect(xAxis.axisLabel.formatter.id).toBe(format);
    },
  );
});
