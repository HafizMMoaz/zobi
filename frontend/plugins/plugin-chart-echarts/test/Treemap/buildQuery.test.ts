import buildQuery from '../../src/Treemap/buildQuery';

describe('Treemap buildQuery', () => {
  const formData = {
    datasource: '5__table',
    granularity_sqla: 'ds',
    metric: 'foo',
    groupby: ['bar'],
    viz_type: 'my_chart',
  };

  test('should build query fields from form data', () => {
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.metrics).toEqual(['foo']);
    expect(query.columns).toEqual(['bar']);
  });
});
