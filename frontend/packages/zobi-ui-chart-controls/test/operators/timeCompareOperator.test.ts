import { QueryObject, SqlaFormData, VizType } from '@zobi-ui/core';
import { timeCompareOperator } from '@zobi-ui/chart-controls';

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
  post_processing: [
    {
      operation: 'pivot',
      options: {
        index: ['__timestamp'],
        columns: ['nation'],
        aggregates: {
          'count(*)': {
            operator: 'mean',
          },
          'sum(val)': {
            operator: 'mean',
          },
        },
        drop_missing_columns: false,
      },
    },
    {
      operation: 'aggregate',
      options: {
        groupby: ['col1'],
        aggregates: {},
      },
    },
  ],
};

test('should skip CompareOperator', () => {
  expect(timeCompareOperator(formData, queryObject)).toEqual(undefined);
  expect(
    timeCompareOperator({ ...formData, time_compare: [] }, queryObject),
  ).toEqual(undefined);
  expect(
    timeCompareOperator({ ...formData, comparison_type: null }, queryObject),
  ).toEqual(undefined);
  expect(
    timeCompareOperator(
      { ...formData, comparison_type: 'foobar' },
      queryObject,
    ),
  ).toEqual(undefined);
  expect(
    timeCompareOperator(
      {
        ...formData,
        comparison_type: 'values',
        time_compare: ['1 year ago', '1 year later'],
      },
      queryObject,
    ),
  ).toEqual(undefined);
});

test('should generate difference/percentage/ratio CompareOperator', () => {
  const comparisonTypes = ['difference', 'percentage', 'ratio'];
  comparisonTypes.forEach(cType => {
    expect(
      timeCompareOperator(
        {
          ...formData,
          comparison_type: cType,
          time_compare: ['1 year ago', '1 year later'],
        },
        queryObject,
      ),
    ).toEqual({
      operation: 'compare',
      options: {
        source_columns: ['count(*)', 'count(*)', 'sum(val)', 'sum(val)'],
        compare_columns: [
          'count(*)__1 year ago',
          'count(*)__1 year later',
          'sum(val)__1 year ago',
          'sum(val)__1 year later',
        ],
        compare_type: cType,
        drop_original_columns: true,
      },
    });
  });
});
