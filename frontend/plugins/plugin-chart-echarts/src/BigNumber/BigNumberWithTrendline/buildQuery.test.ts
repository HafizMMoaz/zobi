import { QueryFormData } from '@zobi-ui/core';
import buildQuery from './buildQuery';

jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  getXAxisColumn: jest.fn(() => 'order_date'),
  isXAxisSet: jest.fn(() => true),
}));

jest.mock('@zobi-ui/chart-controls', () => ({
  pivotOperator: jest.fn(() => ({ operation: 'pivot' })),
  aggregationOperator: jest.fn(formData => {
    if (formData.aggregation === 'LAST_VALUE' || !formData.aggregation) {
      return undefined;
    }
    return {
      operation: 'aggregation',
      options: { operator: formData.aggregation },
    };
  }),
  flattenOperator: jest.fn(() => ({ operation: 'flatten' })),
  resampleOperator: jest.fn(() => ({ operation: 'resample' })),
  rollingWindowOperator: jest.fn(() => ({ operation: 'rolling' })),
}));

describe('BigNumberWithTrendline buildQuery', () => {
  const baseFormData: QueryFormData = {
    datasource: '1__table',
    viz_type: 'big_number',
    metric: 'custom_metric',
    aggregation: null,
  };

  test('creates raw metric query when aggregation is "raw"', () => {
    const queryContext = buildQuery({ ...baseFormData, aggregation: 'raw' });
    const bigNumberQuery = queryContext.queries[1];

    expect(bigNumberQuery.post_processing).toEqual([]);
    expect(bigNumberQuery.is_timeseries).toBe(false);
    expect(bigNumberQuery.columns).toEqual([]);
  });

  test('returns single query for aggregation methods that can be computed client-side', () => {
    const queryContext = buildQuery({ ...baseFormData, aggregation: 'sum' });

    expect(queryContext.queries.length).toBe(1);
    expect(queryContext.queries[0].post_processing).toEqual([
      { operation: 'pivot' },
      { operation: 'resample' },
      { operation: 'rolling' },
      { operation: 'flatten' },
    ]);
  });

  test('returns single query for LAST_VALUE aggregation', () => {
    const queryContext = buildQuery({
      ...baseFormData,
      aggregation: 'LAST_VALUE',
    });

    expect(queryContext.queries.length).toBe(1);
    expect(queryContext.queries[0].post_processing).toEqual([
      { operation: 'pivot' },
      { operation: 'resample' },
      { operation: 'rolling' },
      { operation: 'flatten' },
    ]);
  });

  test('returns two queries only for raw aggregation', () => {
    const queryContext = buildQuery({ ...baseFormData, aggregation: 'raw' });
    expect(queryContext.queries.length).toBe(2);

    const queryContextLastValue = buildQuery({
      ...baseFormData,
      aggregation: 'LAST_VALUE',
    });
    expect(queryContextLastValue.queries.length).toBe(1);

    const queryContextSum = buildQuery({ ...baseFormData, aggregation: 'sum' });
    expect(queryContextSum.queries.length).toBe(1);
  });
});
