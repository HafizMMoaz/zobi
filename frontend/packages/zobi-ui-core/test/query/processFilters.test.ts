import processFilters from '../../src/query/processFilters';

describe('processFilters', () => {
  test('should handle non-array adhoc_filters', () => {
    expect(
      processFilters({
        granularity: 'something',
        viz_type: 'custom',
        datasource: 'boba',
      }),
    ).toEqual(
      expect.objectContaining({
        extras: { having: '', where: '' },
        filters: [],
      }),
    );
  });

  test('should merge simple adhoc_filters and filters', () => {
    expect(
      processFilters({
        granularity: 'something',
        viz_type: 'custom',
        datasource: 'boba',
        filters: [
          {
            col: 'name',
            op: '==',
            val: 'Aaron',
          },
        ],
        adhoc_filters: [
          {
            expressionType: 'SIMPLE',
            clause: 'WHERE',
            subject: 'gender',
            operator: 'IS NOT NULL',
          },
          // ignore simple having filter
          {
            expressionType: 'SIMPLE',
            clause: 'HAVING',
            subject: 'sum(sales)',
            operator: '>',
            comparator: '100',
          },
        ],
      }),
    ).toEqual({
      extras: {
        having: '',
        where: '',
      },
      filters: [
        {
          col: 'name',
          op: '==',
          val: 'Aaron',
        },
        {
          col: 'gender',
          op: 'IS NOT NULL',
        },
      ],
    });
  });

  test('should handle an empty array', () => {
    expect(
      processFilters({
        where: '1 = 1',
        granularity: 'something',
        viz_type: 'custom',
        datasource: 'boba',
        adhoc_filters: [],
      }),
    ).toEqual({
      filters: [],
      extras: {
        having: '',
        where: '(1 = 1)',
      },
    });
  });

  test('should put adhoc_filters into the correct group and format accordingly', () => {
    expect(
      processFilters({
        granularity: 'something',
        viz_type: 'custom',
        datasource: 'boba',
        adhoc_filters: [
          {
            expressionType: 'SIMPLE',
            clause: 'WHERE',
            subject: 'milk',
            operator: 'IS NOT NULL',
          },
          {
            expressionType: 'SIMPLE',
            clause: 'WHERE',
            subject: 'milk',
            operator: '==',
            comparator: 'almond',
          },
          {
            expressionType: 'SQL',
            clause: 'WHERE',
            sqlExpression: "tea = 'jasmine'",
          },
          {
            expressionType: 'SQL',
            clause: 'WHERE',
            sqlExpression: "cup = 'large' -- comment",
          },
          {
            expressionType: 'SQL',
            clause: 'HAVING',
            sqlExpression: 'ice = 25 OR ice = 50',
          },
          {
            expressionType: 'SQL',
            clause: 'HAVING',
            sqlExpression: 'waitTime <= 180 -- comment',
          },
        ],
      }),
    ).toEqual({
      extras: {
        having: '(ice = 25 OR ice = 50) AND (waitTime <= 180 -- comment\n)',
        where: "(tea = 'jasmine') AND (cup = 'large' -- comment\n)",
      },
      filters: [
        {
          col: 'milk',
          op: 'IS NOT NULL',
        },
        {
          col: 'milk',
          op: '==',
          val: 'almond',
        },
      ],
    });
  });
});
