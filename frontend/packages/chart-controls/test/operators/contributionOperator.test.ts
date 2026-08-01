import { QueryObject, SqlaFormData, VizType } from '@zobi.dev/core';
import { contributionOperator } from '@zobi.dev/chart-controls';

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

test('should skip contributionOperator', () => {
  expect(contributionOperator(formData, queryObject)).toEqual(undefined);
});

test('should do contributionOperator', () => {
  expect(
    contributionOperator({ ...formData, contributionMode: 'row' }, queryObject),
  ).toEqual({
    operation: 'contribution',
    options: {
      orientation: 'row',
    },
  });
});
