import { JsonObject, VizType } from '@zobi-ui/core';

export const getExploreFormData = (overrides: JsonObject = {}) => ({
  adhoc_filters: [
    {
      clause: 'WHERE' as const,
      expressionType: 'SIMPLE' as const,
      operator: 'IN' as const,
      subject: 'gender',
      comparator: ['boys'],
      filterOptionName: '123',
    },
    {
      clause: 'WHERE' as const,
      expressionType: 'SQL' as const,
      operator: null,
      subject: null,
      comparator: null,
      sqlExpression: "name = 'John'",
      filterOptionName: '456',
    },
    {
      clause: 'WHERE' as const,
      expressionType: 'SQL' as const,
      operator: null,
      subject: null,
      comparator: null,
      sqlExpression: "city = 'Warsaw'",
      filterOptionName: '567',
    },
    {
      clause: 'WHERE' as const,
      expressionType: 'SIMPLE' as const,
      operator: 'TEMPORAL_RANGE' as const,
      subject: 'ds',
      comparator: 'No filter',
      filterOptionName: '678',
    },
  ],
  adhoc_filters_b: [
    {
      clause: 'WHERE' as const,
      expressionType: 'SQL' as const,
      operator: null,
      subject: null,
      comparator: null,
      sqlExpression: "country = 'Poland'",
      filterOptionName: '789',
    },
  ],
  applied_time_extras: {},
  color_scheme: 'zobiColors',
  datasource: '2__table',
  granularity_sqla: 'ds',
  groupby: ['gender'],
  metric: {
    aggregate: 'SUM',
    column: {
      column_name: 'num',
      type: 'BIGINT',
    },
    expressionType: 'SIMPLE',
    label: 'Births',
  },
  slice_id: 46,
  time_range: '100 years ago : now',
  viz_type: VizType.Pie,
  ...overrides,
});
