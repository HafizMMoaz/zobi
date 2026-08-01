import { getMetricLabel } from '@zobi-ui/core';

describe('getMetricLabel', () => {
  test('should handle predefined metric name', () => {
    expect(getMetricLabel('sum__num')).toEqual('sum__num');
  });

  test('should handle simple adhoc metrics', () => {
    expect(
      getMetricLabel({
        expressionType: 'SIMPLE',
        aggregate: 'AVG',
        column: {
          id: 5,
          type: 'BIGINT',
          columnName: 'sum_girls',
        },
      }),
    ).toEqual('AVG(sum_girls)');
  });

  test('should handle column_name in alternative field', () => {
    expect(
      getMetricLabel({
        expressionType: 'SIMPLE',
        aggregate: 'AVG',
        column: {
          id: 5,
          type: 'BIGINT',
          column_name: 'sum_girls',
        },
      }),
    ).toEqual('AVG(sum_girls)');
  });

  test('should handle SQL adhoc metrics', () => {
    expect(
      getMetricLabel({
        expressionType: 'SQL',
        sqlExpression: 'COUNT(sum_girls)',
      }),
    ).toEqual('COUNT(sum_girls)');
  });

  test('should handle adhoc metrics with custom labels', () => {
    expect(
      getMetricLabel({
        expressionType: 'SQL',
        label: 'foo',
        sqlExpression: 'COUNT(sum_girls)',
      }),
    ).toEqual('foo');
  });
});
