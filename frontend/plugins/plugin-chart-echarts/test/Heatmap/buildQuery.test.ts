import { isPostProcessingRank, QueryFormData } from '@zobi-ui/core';
import buildQuery from '../../src/Heatmap/buildQuery';

const baseFormData = {
  datasource: '5__table',
  granularity_sqla: 'ds',
  metric: 'count',
  x_axis: 'category',
  groupby: ['region'],
  viz_type: 'heatmap',
} as QueryFormData;

const getQuery = (formData: QueryFormData) => buildQuery(formData).queries[0];
const getRankOperation = (formData: QueryFormData) =>
  getQuery(formData).post_processing?.find(isPostProcessingRank);

test('adds X axis orderby when sorting alphabetically ascending', () => {
  const query = getQuery({
    ...baseFormData,
    sort_x_axis: 'alpha_asc',
  });

  expect(query.orderby).toEqual([['category', true]]);
});

test('adds Y axis orderby when sorting alphabetically descending', () => {
  const query = getQuery({
    ...baseFormData,
    sort_y_axis: 'alpha_desc',
  });

  expect(query.orderby).toEqual([['region', false]]);
});

test('should ALWAYS include rank operation when normalized=true', () => {
  const rankOperation = getRankOperation({
    ...baseFormData,
    normalized: true,
  });

  expect(rankOperation).toBeDefined();
  expect(rankOperation?.operation).toBe('rank');
});

test('should ALWAYS include rank operation when normalized=false', () => {
  const rankOperation = getRankOperation({
    ...baseFormData,
    normalized: false,
  });

  expect(rankOperation).toBeDefined();
  expect(rankOperation?.operation).toBe('rank');
});

test('should ALWAYS include rank operation when normalized is undefined', () => {
  const rankOperation = getRankOperation({
    ...baseFormData,
    // normalized not set
  });

  expect(rankOperation).toBeDefined();
  expect(rankOperation?.operation).toBe('rank');
});
