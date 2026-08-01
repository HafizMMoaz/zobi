import { normalizeOrderBy, QueryObject, VizType } from '@zobi-ui/core';

describe('normalizeOrderBy', () => {
  test('should not change original queryObject when orderby populated', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      orderby: [['count(*)', true]],
    };
    expect(normalizeOrderBy(query)).toEqual(query);
  });

  test('has series_limit_metric in queryObject', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      metrics: ['count(*)'],
      series_limit_metric: {
        expressionType: 'SIMPLE',
        column: {
          id: 1,
          column_name: 'sales',
        },
        aggregate: 'SUM',
      },
      order_desc: true,
    };
    const expectedQueryObject = normalizeOrderBy(query);
    expect(expectedQueryObject).not.toHaveProperty('series_limit_metric');
    expect(expectedQueryObject).not.toHaveProperty('order_desc');
    expect(expectedQueryObject).toEqual({
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      metrics: ['count(*)'],
      orderby: [
        [
          {
            expressionType: 'SIMPLE',
            column: {
              id: 1,
              column_name: 'sales',
            },
            aggregate: 'SUM',
          },
          false,
        ],
      ],
    });
  });

  test('should transform legacy_order_by in queryObject', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      metrics: ['count(*)'],
      legacy_order_by: {
        expressionType: 'SIMPLE',
        column: {
          id: 1,
          column_name: 'sales',
        },
        aggregate: 'SUM',
      },
      order_desc: true,
    };
    const expectedQueryObject = normalizeOrderBy(query);
    expect(expectedQueryObject).not.toHaveProperty('legacy_order_by');
    expect(expectedQueryObject).not.toHaveProperty('order_desc');
    expect(expectedQueryObject).toEqual({
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      metrics: ['count(*)'],
      orderby: [
        [
          {
            expressionType: 'SIMPLE',
            column: {
              id: 1,
              column_name: 'sales',
            },
            aggregate: 'SUM',
          },
          false,
        ],
      ],
    });
  });

  test('has metrics in queryObject', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      metrics: ['count(*)'],
      order_desc: true,
    };
    const expectedQueryObject = normalizeOrderBy(query);
    expect(expectedQueryObject).not.toHaveProperty('series_limit_metric');
    expect(expectedQueryObject).not.toHaveProperty('order_desc');
    expect(expectedQueryObject).toEqual({
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      metrics: ['count(*)'],
      orderby: [['count(*)', false]],
    });
  });

  test('should not change', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
    };
    expect(normalizeOrderBy(query)).toEqual(query);
  });

  test('remove empty orderby', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      orderby: [],
    };
    expect(normalizeOrderBy(query)).not.toHaveProperty('orderby');
  });

  test('remove orderby with an empty array', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      orderby: [[]],
    };
    expect(normalizeOrderBy(query)).not.toHaveProperty('orderby');
  });

  test('remove orderby with an empty metric', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      orderby: [['', true]],
    };
    expect(normalizeOrderBy(query)).not.toHaveProperty('orderby');
  });

  test('remove orderby with an empty adhoc metric', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      orderby: [[{}, true]],
    };
    expect(normalizeOrderBy(query)).not.toHaveProperty('orderby');
  });

  test('remove orderby with an non-boolean type', () => {
    const query: QueryObject = {
      datasource: '5__table',
      viz_type: VizType.Table,
      time_range: '1 year ago : 2013',
      // @ts-expect-error
      orderby: [['count(*)', 'true']],
    };
    expect(normalizeOrderBy(query)).not.toHaveProperty('orderby');
  });
});
