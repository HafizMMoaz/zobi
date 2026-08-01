import buildQuery from '../../src/Bubble/buildQuery';

describe('Bubble buildQuery', () => {
  const formData = {
    datasource: '1__table',
    viz_type: 'echarts_bubble',
    entity: 'customer_name',
    x: 'count',
    y: {
      aggregate: 'sum',
      column: {
        column_name: 'price_each',
      },
      expressionType: 'simple',
      label: 'SUM(price_each)',
    },
    size: {
      aggregate: 'sum',
      column: {
        column_name: 'sales',
      },
      expressionType: 'simple',
      label: 'SUM(sales)',
    },
  };

  test('Should build query without dimension', () => {
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['customer_name']);
    expect(query.metrics).toEqual([
      'count',
      {
        aggregate: 'sum',
        column: {
          column_name: 'price_each',
        },
        expressionType: 'simple',
        label: 'SUM(price_each)',
      },
      {
        aggregate: 'sum',
        column: {
          column_name: 'sales',
        },
        expressionType: 'simple',
        label: 'SUM(sales)',
      },
    ]);
  });
  test('Should build query with dimension', () => {
    const queryContext = buildQuery({ ...formData, series: 'state' });
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['customer_name', 'state']);
    expect(query.metrics).toEqual([
      'count',
      {
        aggregate: 'sum',
        column: {
          column_name: 'price_each',
        },
        expressionType: 'simple',
        label: 'SUM(price_each)',
      },
      {
        aggregate: 'sum',
        column: {
          column_name: 'sales',
        },
        expressionType: 'simple',
        label: 'SUM(sales)',
      },
    ]);
  });
});
