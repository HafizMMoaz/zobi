import { QueryObject, SqlaFormData, VizType } from '@zobi-ui/core';
import { rollingWindowOperator } from '@zobi-ui/chart-controls';

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
            operator: 'sum',
          },
        },
      },
    },
  ],
};

test('skip transformation', () => {
  expect(rollingWindowOperator(formData, queryObject)).toEqual(undefined);
  expect(
    rollingWindowOperator({ ...formData, rolling_type: 'None' }, queryObject),
  ).toEqual(undefined);
  expect(
    rollingWindowOperator({ ...formData, rolling_type: 'foobar' }, queryObject),
  ).toEqual(undefined);

  const formDataWithoutMetrics = { ...formData };
  delete formDataWithoutMetrics.metrics;
  expect(rollingWindowOperator(formDataWithoutMetrics, queryObject)).toEqual(
    undefined,
  );
});

test('rolling_type: cumsum', () => {
  expect(
    rollingWindowOperator({ ...formData, rolling_type: 'cumsum' }, queryObject),
  ).toEqual({
    operation: 'cum',
    options: {
      operator: 'sum',
      columns: {
        'count(*)': 'count(*)',
        'sum(val)': 'sum(val)',
      },
    },
  });
});

test('rolling_type: sum/mean/std', () => {
  const rollingTypes = ['sum', 'mean', 'std'];
  rollingTypes.forEach(rollingType => {
    expect(
      rollingWindowOperator(
        { ...formData, rolling_type: rollingType },
        queryObject,
      ),
    ).toEqual({
      operation: 'rolling',
      options: {
        rolling_type: rollingType,
        window: 1,
        min_periods: 0,
        columns: {
          'count(*)': 'count(*)',
          'sum(val)': 'sum(val)',
        },
      },
    });
  });
});

test('should append compared metrics when sets time compare type', () => {
  const comparisonTypes = ['values', 'difference', 'percentage', 'ratio'];
  comparisonTypes.forEach(cType => {
    expect(
      rollingWindowOperator(
        {
          ...formData,
          rolling_type: 'cumsum',
          comparison_type: cType,
          time_compare: ['1 year ago', '1 year later'],
        },
        queryObject,
      ),
    ).toEqual({
      operation: 'cum',
      options: {
        operator: 'sum',
        columns: {
          'count(*)': 'count(*)',
          'count(*)__1 year ago': 'count(*)__1 year ago',
          'count(*)__1 year later': 'count(*)__1 year later',
          'sum(val)': 'sum(val)',
          'sum(val)__1 year ago': 'sum(val)__1 year ago',
          'sum(val)__1 year later': 'sum(val)__1 year later',
        },
      },
    });
  });
});
