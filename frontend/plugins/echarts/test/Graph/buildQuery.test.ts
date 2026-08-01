import buildQuery from '../../src/Graph/buildQuery';
import { DEFAULT_FORM_DATA } from '../../src/Graph/types';

describe('Graph buildQuery', () => {
  const formData = {
    ...DEFAULT_FORM_DATA,
    datasource: '5__table',
    granularity_sqla: 'ds',
    source: 'dummy_source',
    target: 'dummy_target',
    metrics: ['foo', 'bar'],
    viz_type: 'my_chart',
  };

  test('should build groupby with source and target categories', () => {
    const formDataWithCategories = {
      ...formData,
      source: 'dummy_source',
      target: 'dummy_target',
      source_category: 'dummy_source_category',
      target_category: 'dummy_target_category',
    };
    const queryContext = buildQuery(formDataWithCategories);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual([
      'dummy_source',
      'dummy_target',
      'dummy_source_category',
      'dummy_target_category',
    ]);
    expect(query.metrics).toEqual(['foo', 'bar']);
  });

  test('should build groupby with source category', () => {
    const formDataWithCategories = {
      ...formData,
      source: 'dummy_source',
      target: 'dummy_target',
      source_category: 'dummy_source_category',
    };
    const queryContext = buildQuery(formDataWithCategories);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual([
      'dummy_source',
      'dummy_target',
      'dummy_source_category',
    ]);
    expect(query.metrics).toEqual(['foo', 'bar']);
  });

  test('should build groupby with target category', () => {
    const formDataWithCategories = {
      ...formData,
      source: 'dummy_source',
      target: 'dummy_target',
      target_category: 'dummy_target_category',
    };
    const queryContext = buildQuery(formDataWithCategories);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual([
      'dummy_source',
      'dummy_target',
      'dummy_target_category',
    ]);
    expect(query.metrics).toEqual(['foo', 'bar']);
  });

  test('should build groupby without any category', () => {
    const formDataWithCategories = {
      ...formData,
      source: 'dummy_source',
      target: 'dummy_target',
    };
    const queryContext = buildQuery(formDataWithCategories);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['dummy_source', 'dummy_target']);
    expect(query.metrics).toEqual(['foo', 'bar']);
  });
});
