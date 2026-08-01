import { QueryObject, SqlaFormData, VizType } from '@zobi.dev/core';
import { resampleOperator } from '@zobi.dev/chart-controls';

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

test('should skip resampleOperator', () => {
  expect(resampleOperator(formData, queryObject)).toEqual(undefined);
  expect(
    resampleOperator({ ...formData, resample_method: 'ffill' }, queryObject),
  ).toEqual(undefined);
  expect(
    resampleOperator({ ...formData, resample_rule: '1D' }, queryObject),
  ).toEqual(undefined);
});

test('should do resample on implicit time column', () => {
  expect(
    resampleOperator(
      { ...formData, resample_method: 'ffill', resample_rule: '1D' },
      queryObject,
    ),
  ).toEqual({
    operation: 'resample',
    options: {
      method: 'ffill',
      rule: '1D',
      fill_value: null,
    },
  });
});

test('should do resample on x-axis', () => {
  expect(
    resampleOperator(
      {
        ...formData,
        x_axis: 'ds',
        resample_method: 'ffill',
        resample_rule: '1D',
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'resample',
    options: {
      fill_value: null,
      method: 'ffill',
      rule: '1D',
    },
  });
});

test('should do zerofill resample', () => {
  expect(
    resampleOperator(
      { ...formData, resample_method: 'zerofill', resample_rule: '1D' },
      queryObject,
    ),
  ).toEqual({
    operation: 'resample',
    options: {
      method: 'asfreq',
      rule: '1D',
      fill_value: 0,
    },
  });
});
