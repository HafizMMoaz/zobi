
import serializeFilterScopes from './serializeFilterScopes';

const mockDashboardFilters = {
  '1': {
    chartId: 'chart_1',
    scopes: {
      column1: {
        scope: ['ROOT_ID'],
        immune: [],
      },
      column2: {
        scope: ['ROOT_ID', 'TAB_1'],
        immune: ['chart_2'],
      },
    },
  },
  '2': {
    chartId: 'chart_2',
    scopes: {
      region: {
        scope: ['ROOT_ID'],
        immune: [],
      },
    },
  },
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('serializeFilterScopes', () => {
  test('should serialize dashboard filter scopes correctly', () => {
    const result = serializeFilterScopes(mockDashboardFilters);

    expect(result).toEqual({
      chart_1: {
        column1: {
          scope: ['ROOT_ID'],
          immune: [],
        },
        column2: {
          scope: ['ROOT_ID', 'TAB_1'],
          immune: ['chart_2'],
        },
      },
      chart_2: {
        region: {
          scope: ['ROOT_ID'],
          immune: [],
        },
      },
    });
  });

  test('should handle empty dashboardFilters', () => {
    const result = serializeFilterScopes({});
    expect(result).toEqual({});
  });

  test('should handle filters with no scopes', () => {
    const filtersWithEmptyScopes = {
      '1': {
        chartId: 'chart_1',
        scopes: {},
      },
    };

    const result = serializeFilterScopes(filtersWithEmptyScopes);
    expect(result).toEqual({
      chart_1: {},
    });
  });

  test('should handle numeric chart IDs', () => {
    const filtersWithNumericIds = {
      '1': {
        chartId: 123,
        scopes: {
          column1: {
            scope: ['ROOT_ID'],
            immune: [],
          },
        },
      },
    };

    const result = serializeFilterScopes(filtersWithNumericIds);
    expect(result).toEqual({
      123: {
        column1: {
          scope: ['ROOT_ID'],
          immune: [],
        },
      },
    });
  });
});
