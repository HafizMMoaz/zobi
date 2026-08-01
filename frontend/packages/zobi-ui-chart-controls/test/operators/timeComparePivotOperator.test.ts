import { QueryObject, SqlaFormData, VizType } from '@zobi-ui/core';
import {
  timeCompareOperator,
  timeComparePivotOperator,
} from '@zobi-ui/chart-controls';

const formData: SqlaFormData = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  time_range: '2015 : 2016',
  granularity: 'month',
  datasource: 'foo',
  viz_type: VizType.Table,
  show_empty_columns: true,
};
const queryObject: QueryObject = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  columns: ['foo', 'bar'],
  time_range: '2015 : 2016',
  granularity: 'month',
  post_processing: [],
};

test('should skip pivot', () => {
  expect(timeComparePivotOperator(formData, queryObject)).toEqual(undefined);
  expect(
    timeComparePivotOperator({ ...formData, time_compare: [] }, queryObject),
  ).toEqual(undefined);
  expect(
    timeComparePivotOperator(
      { ...formData, comparison_type: null },
      queryObject,
    ),
  ).toEqual(undefined);
  expect(
    timeCompareOperator(
      { ...formData, comparison_type: 'foobar' },
      queryObject,
    ),
  ).toEqual(undefined);
});

test('should pivot on any type of timeCompare', () => {
  const anyTimeCompareTypes = ['values', 'difference', 'percentage', 'ratio'];
  anyTimeCompareTypes.forEach(cType => {
    expect(
      timeComparePivotOperator(
        {
          ...formData,
          comparison_type: cType,
          time_compare: ['1 year ago', '1 year later'],
          granularity_sqla: 'time_column',
        },
        {
          ...queryObject,
        },
      ),
    ).toEqual({
      operation: 'pivot',
      options: {
        aggregates: {
          'count(*)': { operator: 'mean' },
          'count(*)__1 year ago': { operator: 'mean' },
          'count(*)__1 year later': { operator: 'mean' },
          'sum(val)': { operator: 'mean' },
          'sum(val)__1 year ago': {
            operator: 'mean',
          },
          'sum(val)__1 year later': {
            operator: 'mean',
          },
        },
        drop_missing_columns: false,
        columns: ['foo', 'bar'],
        index: ['__timestamp'],
      },
    });
  });
});

test('should pivot on x-axis', () => {
  expect(
    timeComparePivotOperator(
      {
        ...formData,
        comparison_type: 'values',
        time_compare: ['1 year ago', '1 year later'],
        x_axis: 'ds',
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'pivot',
    options: {
      aggregates: {
        'count(*)': { operator: 'mean' },
        'count(*)__1 year ago': { operator: 'mean' },
        'count(*)__1 year later': { operator: 'mean' },
        'sum(val)': {
          operator: 'mean',
        },
        'sum(val)__1 year ago': {
          operator: 'mean',
        },
        'sum(val)__1 year later': {
          operator: 'mean',
        },
      },
      drop_missing_columns: false,
      columns: ['foo', 'bar'],
      index: ['ds'],
    },
  });
});

test('should pivot on x-axis with series_columns', () => {
  expect(
    timeComparePivotOperator(
      {
        ...formData,
        comparison_type: 'values',
        time_compare: ['1 year ago', '1 year later'],
        x_axis: 'ds',
      },
      {
        ...queryObject,
        columns: ['ds', 'foo', 'bar'],
        series_columns: ['foo', 'bar'],
      },
    ),
  ).toEqual({
    operation: 'pivot',
    options: {
      aggregates: {
        'count(*)': { operator: 'mean' },
        'count(*)__1 year ago': { operator: 'mean' },
        'count(*)__1 year later': { operator: 'mean' },
        'sum(val)': {
          operator: 'mean',
        },
        'sum(val)__1 year ago': {
          operator: 'mean',
        },
        'sum(val)__1 year later': {
          operator: 'mean',
        },
      },
      drop_missing_columns: false,
      columns: ['foo', 'bar'],
      index: ['ds'],
    },
  });
});

test('should pivot on adhoc x-axis', () => {
  expect(
    timeComparePivotOperator(
      {
        ...formData,
        comparison_type: 'values',
        time_compare: ['1 year ago', '1 year later'],
        x_axis: {
          label: 'my_case_expr',
          expressionType: 'SQL',
          sqlExpression: 'case when a = 1 then 1 else 0 end',
        },
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'pivot',
    options: {
      aggregates: {
        'count(*)': { operator: 'mean' },
        'count(*)__1 year ago': { operator: 'mean' },
        'count(*)__1 year later': { operator: 'mean' },
        'sum(val)': {
          operator: 'mean',
        },
        'sum(val)__1 year ago': {
          operator: 'mean',
        },
        'sum(val)__1 year later': {
          operator: 'mean',
        },
      },
      drop_missing_columns: false,
      columns: ['foo', 'bar'],
      index: ['my_case_expr'],
    },
  });
});
