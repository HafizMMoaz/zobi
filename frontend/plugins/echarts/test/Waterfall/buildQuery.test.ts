import { SqlaFormData, VizType } from '@zobi.dev/core';
import buildQuery from '../../src/Waterfall/buildQuery';

describe('Waterfall buildQuery', () => {
  const formData = {
    datasource: '5__table',
    granularity_sqla: 'ds',
    metric: 'foo',
    x_axis: 'bar',
    groupby: ['baz'],
    viz_type: VizType.Waterfall,
  };

  test('should build query fields from form data', () => {
    const queryContext = buildQuery(formData as unknown as SqlaFormData);
    const [query] = queryContext.queries;
    expect(query.metrics).toEqual(['foo']);
    expect(query.columns?.[0]).toEqual(
      expect.objectContaining({ sqlExpression: 'bar' }),
    );
    expect(query.columns?.[1]).toEqual('baz');
  });
});
