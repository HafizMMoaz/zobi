import { QueryObject, SqlaFormData, VizType } from '@zobi-ui/core';
import { sortOperator } from '@zobi-ui/chart-controls';

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

test('should ignore the sortOperator', () => {
  expect(
    sortOperator(
      {
        ...formData,

        x_axis_sort: undefined,
        x_axis_sort_asc: true,
      },
      queryObject,
    ),
  ).toEqual(undefined);

  // sortOperator doesn't support multiple series
  expect(
    sortOperator(
      {
        ...formData,

        x_axis_sort: 'metric label',
        x_axis_sort_asc: true,
        groupby: ['col1'],
        x_axis: 'axis column',
      },
      queryObject,
    ),
  ).toEqual(undefined);
});

test('should sort by metric', () => {
  expect(
    sortOperator(
      {
        ...formData,

        metrics: ['a metric label'],
        x_axis_sort: 'a metric label',
        x_axis_sort_asc: true,
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'sort',
    options: {
      by: 'a metric label',
      ascending: true,
    },
  });
});

test('should sort by axis', () => {
  expect(
    sortOperator(
      {
        ...formData,

        x_axis_sort: 'Categorical Column',
        x_axis_sort_asc: true,
        x_axis: 'Categorical Column',
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'sort',
    options: {
      is_sort_index: true,
      ascending: true,
    },
  });
});

test('should sort by extra metric', () => {
  expect(
    sortOperator(
      {
        ...formData,
        x_axis_sort: 'my_limit_metric',
        x_axis_sort_asc: true,
        x_axis: 'Categorical Column',
        groupby: [],
        timeseries_limit_metric: 'my_limit_metric',
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'sort',
    options: {
      by: 'my_limit_metric',
      ascending: true,
    },
  });
});
