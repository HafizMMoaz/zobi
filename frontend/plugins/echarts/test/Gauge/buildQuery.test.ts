import buildQuery from '../../src/Gauge/buildQuery';

describe('Gauge buildQuery', () => {
  const baseFormData = {
    datasource: '5__table',
    metric: 'foo',
    viz_type: 'my_chart',
  };

  test('should build query fields with no group by column', () => {
    const formData = { ...baseFormData, groupby: undefined };
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual([]);
  });

  test('should build query fields with single group by column', () => {
    const formData = { ...baseFormData, groupby: ['foo'] };
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['foo']);
  });

  test('should build query fields with multiple group by columns', () => {
    const formData = { ...baseFormData, groupby: ['foo', 'bar'] };
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['foo', 'bar']);
  });
});
