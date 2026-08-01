import { QueryFormData, QueryFormMetric, VizType } from '@zobi-ui/core';
import { extractExtraMetrics } from '@zobi-ui/chart-controls';

const baseFormData: QueryFormData = {
  datasource: 'dummy',
  viz_type: VizType.Table,
  metrics: ['a', 'b'],
  columns: ['foo', 'bar'],
  limit: 100,
  metrics_b: ['c', 'd'],
  columns_b: ['hello', 'world'],
  limit_b: 200,
};

const metric: QueryFormMetric = {
  expressionType: 'SQL',
  sqlExpression: 'case when 1 then 1 else 2 end',
  label: 'foo',
};

test('returns empty array if relevant controls missing', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
    }),
  ).toEqual([]);
});

test('returns empty array if x_axis_sort is not same as timeseries_limit_metric', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
      timeseries_limit_metric: 'foo',
      x_axis_sort: 'bar',
    }),
  ).toEqual([]);
});

test('returns correct column if sort columns match', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
      timeseries_limit_metric: 'foo',
      x_axis_sort: 'foo',
    }),
  ).toEqual(['foo']);
});

test('handles adhoc metrics correctly', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
      timeseries_limit_metric: metric,
      x_axis_sort: 'foo',
    }),
  ).toEqual([metric]);

  expect(
    extractExtraMetrics({
      ...baseFormData,
      timeseries_limit_metric: metric,
      x_axis_sort: 'bar',
    }),
  ).toEqual([]);
});

test('returns empty array if groupby populated', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
      groupby: ['bar'],
      timeseries_limit_metric: 'foo',
      x_axis_sort: 'foo',
    }),
  ).toEqual([]);
});

test('returns empty array if timeseries_limit_metric and x_axis_sort are included in main metrics array', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
      timeseries_limit_metric: 'a',
      x_axis_sort: 'a',
    }),
  ).toEqual([]);
});

test('returns empty array if timeseries_limit_metric and x_axis_sort are included in main metrics array with adhoc metrics', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
      metrics: [
        'a',
        {
          expressionType: 'SIMPLE',
          aggregate: 'SUM',
          column: { column_name: 'num' },
        },
      ],
      timeseries_limit_metric: {
        expressionType: 'SIMPLE',
        aggregate: 'SUM',
        column: { column_name: 'num' },
      },
      x_axis_sort: 'SUM(num)',
    }),
  ).toEqual([]);
});

test('returns empty array if timeseries_limit_metric is an empty array', () => {
  expect(
    extractExtraMetrics({
      ...baseFormData,
      // @ts-expect-error
      timeseries_limit_metric: [],
    }),
  ).toEqual([]);
});
