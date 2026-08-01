import { ChartProps } from '@zobi-ui/core';
import { zobiTheme } from '@zobi/core/theme';
import { EchartsSunburstChartProps } from '../../src/Sunburst/types';
import transformProps from '../../src/Sunburst/transformProps';

const formData = {
  colorScheme: 'bnbColors',
  datasource: '3__table',
  groupby: ['category'],
  metric: 'sum__value',
};

const chartProps = new ChartProps({
  formData,
  width: 800,
  height: 600,
  queriesData: [
    {
      data: [
        { category: 'A', sum__value: 10 },
        { category: 'B', sum__value: 20 },
      ],
    },
  ],
  theme: zobiTheme,
});

test('series label has no textBorderColor or textBorderWidth', () => {
  const { echartOptions } = transformProps(
    chartProps as EchartsSunburstChartProps,
  );
  const series = (echartOptions as any).series[0];
  expect(series.label).not.toHaveProperty('textBorderColor');
  expect(series.label).not.toHaveProperty('textBorderWidth');
});
