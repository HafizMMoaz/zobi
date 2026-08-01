import { QueryObject, SqlaFormData, VizType } from '@zobi-ui/core';
import { rankOperator } from '@zobi-ui/chart-controls';

const formData: SqlaFormData = {
  x_axis: 'dttm',
  metrics: ['sales'],
  groupby: ['department'],
  time_range: '2015 : 2016',
  granularity: 'month',
  datasource: 'foo',
  viz_type: VizType.Table,
  truncate_metric: true,
};
const queryObject: QueryObject = {
  is_timeseries: true,
  metrics: ['sales'],
  columns: ['department'],
  time_range: '2015 : 2016',
  granularity: 'month',
  post_processing: [],
};

test('should add rankOperator', () => {
  const options = { metric: 'sales', group_by: 'department' };
  expect(rankOperator(formData, queryObject, options)).toEqual({
    operation: 'rank',
    options,
  });
});
