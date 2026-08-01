import { QueryObject, SqlaFormData, VizType } from '@zobi-ui/core';
import { aggregationOperator } from '@zobi-ui/chart-controls';

describe('aggregationOperator', () => {
  const formData: SqlaFormData = {
    metrics: [
      'count(*)',
      { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
    ],
    time_range: '2015 : 2016',
    granularity: 'month',
    datasource: 'foo',
    viz_type: VizType.Table,
  };

  const queryObject: QueryObject = {
    metrics: [
      'count(*)',
      { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
    ],
    time_range: '2015 : 2016',
    granularity: 'month',
  };

  test('should return undefined for LAST_VALUE aggregation', () => {
    const formDataWithLastValue = {
      ...formData,
      aggregation: 'LAST_VALUE',
    };

    expect(
      aggregationOperator(formDataWithLastValue, queryObject),
    ).toBeUndefined();
  });

  test('should return undefined when metrics is empty', () => {
    const queryObjectWithoutMetrics = {
      ...queryObject,
      metrics: [],
    };

    const formDataWithSum = {
      ...formData,
      aggregation: 'sum',
    };

    expect(
      aggregationOperator(formDataWithSum, queryObjectWithoutMetrics),
    ).toBeUndefined();
  });

  test('should apply sum aggregation to all metrics', () => {
    const formDataWithSum = {
      ...formData,
      aggregation: 'sum',
    };

    expect(aggregationOperator(formDataWithSum, queryObject)).toEqual({
      operation: 'aggregate',
      options: {
        groupby: [],
        aggregates: {
          'count(*)': {
            operator: 'sum',
            column: 'count(*)',
          },
          'sum(val)': {
            operator: 'sum',
            column: 'sum(val)',
          },
        },
      },
    });
  });

  test('should apply mean aggregation to all metrics', () => {
    const formDataWithMean = {
      ...formData,
      aggregation: 'mean',
    };

    expect(aggregationOperator(formDataWithMean, queryObject)).toEqual({
      operation: 'aggregate',
      options: {
        groupby: [],
        aggregates: {
          'count(*)': {
            operator: 'mean',
            column: 'count(*)',
          },
          'sum(val)': {
            operator: 'mean',
            column: 'sum(val)',
          },
        },
      },
    });
  });

  test('should use default aggregation when not specified', () => {
    expect(aggregationOperator(formData, queryObject)).toBeUndefined();
  });
});
