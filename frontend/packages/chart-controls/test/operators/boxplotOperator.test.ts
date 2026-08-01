import { QueryObject, SqlaFormData, VizType } from '@zobi.dev/core';
import { boxplotOperator } from '@zobi.dev/chart-controls';

const formData: SqlaFormData = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  time_range: '2015 : 2016',
  time_grain_sqla: 'P1Y',
  datasource: 'foo',
  viz_type: VizType.Table,
};
const queryObject: QueryObject = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  time_range: '2015 : 2016',
  granularity: 'P1Y',
};

test('should skip boxplotOperator', () => {
  expect(boxplotOperator(formData, queryObject)).toEqual(undefined);
});

test('should do tukey boxplot', () => {
  expect(
    boxplotOperator(
      {
        ...formData,
        whiskerOptions: 'Tukey',
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'boxplot',
    options: {
      whisker_type: 'tukey',
      percentiles: undefined,
      groupby: [],
      metrics: ['count(*)', 'sum(val)'],
    },
  });
});

test('should do min/max boxplot', () => {
  expect(
    boxplotOperator(
      {
        ...formData,
        whiskerOptions: 'Min/max (no outliers)',
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'boxplot',
    options: {
      whisker_type: 'min/max',
      percentiles: undefined,
      groupby: [],
      metrics: ['count(*)', 'sum(val)'],
    },
  });
});

test('should do percentile boxplot', () => {
  expect(
    boxplotOperator(
      {
        ...formData,
        whiskerOptions: '1/4 percentiles',
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'boxplot',
    options: {
      whisker_type: 'percentile',
      percentiles: [1, 4],
      groupby: [],
      metrics: ['count(*)', 'sum(val)'],
    },
  });
});

test('should throw an error', () => {
  expect(() =>
    boxplotOperator(
      {
        ...formData,
        whiskerOptions: 'foobar',
      },
      queryObject,
    ),
  ).toThrow('Unsupported whisker type: foobar');
});
