import { ChartProps } from '@zobi.dev/core';
import { zobiTheme } from '@zobi.dev/extension-api/theme';
import {
  EchartsWaterfallChartProps,
  WaterfallChartTransformedProps,
} from '../../src/Waterfall/types';
import transformProps from '../../src/Waterfall/transformProps';

const extractSeries = (props: WaterfallChartTransformedProps) => {
  const { echartOptions } = props;
  const { series } = echartOptions as unknown as {
    series: [{ data: [{ value: number }] }];
  };
  return series.map(item => item.data).map(item => item.map(i => i.value));
};

const extractSeriesName = (props: WaterfallChartTransformedProps) => {
  const { echartOptions } = props;
  const { series } = echartOptions as unknown as {
    series: [{ name: string }];
  };
  return series.map(item => item.name);
};

const data = [
  { year: '2019', name: 'Sylvester', sum: 10 },
  { year: '2019', name: 'Arnold', sum: 3 },
  { year: '2020', name: 'Sylvester', sum: -10 },
  { year: '2020', name: 'Arnold', sum: 5 },
];

const formData = {
  colorScheme: 'bnbColors',
  datasource: '3__table',
  x_axis: 'year',
  metric: 'sum',
  increaseColor: { r: 0, b: 0, g: 0 },
  decreaseColor: { r: 0, b: 0, g: 0 },
  totalColor: { r: 0, b: 0, g: 0 },
  showTotal: true,
};

test('should tranform chart props for viz when breakdown not exist', () => {
  const chartProps = new ChartProps({
    formData: { ...formData, series: 'bar' },
    width: 800,
    height: 600,
    queriesData: [
      {
        data,
      },
    ],
    theme: zobiTheme,
  });
  const transformedProps = transformProps(
    chartProps as unknown as EchartsWaterfallChartProps,
  );
  expect(extractSeries(transformedProps)).toEqual([
    [0, 8, '-'],
    [13, '-', '-'],
    ['-', 5, '-'],
    ['-', '-', 8],
  ]);
});

test('should tranform chart props for viz when breakdown exist', () => {
  const chartProps = new ChartProps({
    formData: { ...formData, groupby: 'name' },
    width: 800,
    height: 600,
    queriesData: [
      {
        data,
      },
    ],
    theme: zobiTheme,
  });
  const transformedProps = transformProps(
    chartProps as unknown as EchartsWaterfallChartProps,
  );
  expect(extractSeries(transformedProps)).toEqual([
    [0, 10, '-', 3, 3, '-'],
    [10, 3, '-', '-', 5, '-'],
    ['-', '-', '-', 10, '-', '-'],
    ['-', '-', 13, '-', '-', 8],
  ]);
});

test('renaming series names, checking legend and X axis labels', () => {
  const chartProps = new ChartProps({
    formData: {
      ...formData,
      increaseLabel: 'sale increase',
      decreaseLabel: 'sale decrease',
      totalLabel: 'sale total',
    },
    width: 800,
    height: 600,
    queriesData: [
      {
        data,
      },
    ],
    theme: zobiTheme,
  });
  const transformedProps = transformProps(
    chartProps as unknown as EchartsWaterfallChartProps,
  );
  expect((transformedProps.echartOptions.legend as any).data).toEqual([
    'sale increase',
    'sale decrease',
    'sale total',
  ]);

  expect((transformedProps.echartOptions.xAxis as any).data).toEqual([
    '2019',
    '2020',
    'sale total',
  ]);

  expect(extractSeriesName(transformedProps)).toEqual([
    'Assist',
    'sale increase',
    'sale decrease',
    'sale total',
  ]);
});

test('hide totals', () => {
  const chartProps = new ChartProps({
    formData: { ...formData, series: 'bar', showTotal: false },
    width: 800,
    height: 600,
    queriesData: [
      {
        data,
      },
    ],
    theme: zobiTheme,
  });
  const transformedProps = transformProps(
    chartProps as unknown as EchartsWaterfallChartProps,
  );
  expect(extractSeries(transformedProps)).toEqual([
    [0, 8],
    [13, '-'],
    ['-', 5],
    ['-', '-'],
  ]);
});
