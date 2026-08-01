import {
  normalizeTimeColumn,
  QueryObject,
  SqlaFormData,
  VizType,
} from '@zobi.dev/core';

test('should return original QueryObject if x_axis is empty', () => {
  const formData: SqlaFormData = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    time_grain_sqla: 'P1Y',
    time_range: '1 year ago : 2013',
    columns: ['col1'],
    metrics: ['count(*)'],
  };
  const query: QueryObject = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    extras: {
      time_grain_sqla: 'P1Y',
    },
    time_range: '1 year ago : 2013',
    orderby: [['count(*)', true]],
    columns: ['col1'],
    metrics: ['count(*)'],
    is_timeseries: true,
  };
  expect(normalizeTimeColumn(formData, query)).toEqual(query);
});

test('should support different columns for x-axis and granularity', () => {
  const formData: SqlaFormData = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    time_grain_sqla: 'P1Y',
    time_range: '1 year ago : 2013',
    x_axis: 'time_column_in_x_axis',
    columns: ['col1'],
    metrics: ['count(*)'],
  };
  const query: QueryObject = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    extras: {
      time_grain_sqla: 'P1Y',
      where: '',
      having: '',
    },
    time_range: '1 year ago : 2013',
    orderby: [['count(*)', true]],
    columns: ['time_column_in_x_axis', 'col1'],
    metrics: ['count(*)'],
    is_timeseries: true,
  };
  expect(normalizeTimeColumn(formData, query)).toEqual({
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    extras: { where: '', having: '', time_grain_sqla: 'P1Y' },
    time_range: '1 year ago : 2013',
    orderby: [['count(*)', true]],
    columns: [
      {
        timeGrain: 'P1Y',
        columnType: 'BASE_AXIS',
        isColumnReference: true,
        sqlExpression: 'time_column_in_x_axis',
        label: 'time_column_in_x_axis',
        expressionType: 'SQL',
      },
      'col1',
    ],
    metrics: ['count(*)'],
  });
});

test('should support custom SQL in x-axis', () => {
  const formData: SqlaFormData = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    time_grain_sqla: 'P1Y',
    time_range: '1 year ago : 2013',
    x_axis: {
      expressionType: 'SQL',
      label: 'Order Data + 1 year',
      sqlExpression: '"Order Date" + interval \'1 year\'',
    },
    columns: ['col1'],
    metrics: ['count(*)'],
  };
  const query: QueryObject = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    extras: {
      time_grain_sqla: 'P1Y',
      where: '',
      having: '',
    },
    time_range: '1 year ago : 2013',
    orderby: [['count(*)', true]],
    columns: [
      {
        expressionType: 'SQL',
        label: 'Order Data + 1 year',
        sqlExpression: '"Order Date" + interval \'1 year\'',
      },
      'col1',
    ],
    metrics: ['count(*)'],
    is_timeseries: true,
  };
  expect(normalizeTimeColumn(formData, query)).toEqual({
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    extras: { where: '', having: '', time_grain_sqla: 'P1Y' },
    time_range: '1 year ago : 2013',
    orderby: [['count(*)', true]],
    columns: [
      {
        timeGrain: 'P1Y',
        columnType: 'BASE_AXIS',
        expressionType: 'SQL',
        label: 'Order Data + 1 year',
        sqlExpression: `"Order Date" + interval '1 year'`,
      },
      'col1',
    ],
    metrics: ['count(*)'],
  });
});

test('fallback and invalid columns value', () => {
  const formData: SqlaFormData = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    time_grain_sqla: 'P1Y',
    time_range: '1 year ago : 2013',
    x_axis: {
      expressionType: 'SQL',
      label: 'Order Data + 1 year',
      sqlExpression: '"Order Date" + interval \'1 year\'',
    },
    columns: ['col1'],
    metrics: ['count(*)'],
  };
  const query: QueryObject = {
    datasource: '5__table',
    viz_type: VizType.Table,
    granularity: 'time_column',
    extras: {
      time_grain_sqla: 'P1Y',
      where: '',
      having: '',
    },
    time_range: '1 year ago : 2013',
    orderby: [['count(*)', true]],
    metrics: ['count(*)'],
    is_timeseries: true,
  };
  expect(normalizeTimeColumn(formData, query)).toEqual(query);
});
