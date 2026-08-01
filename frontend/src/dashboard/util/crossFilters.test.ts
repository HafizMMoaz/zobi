import { Behavior, getChartMetadataRegistry, VizType } from '@zobi-ui/core';
import { getCrossFiltersConfiguration } from './crossFilters';
import { DEFAULT_CROSS_FILTER_SCOPING } from '../constants';

const DASHBOARD_LAYOUT = {
  'CHART-1': {
    children: [],
    id: 'CHART-1',
    meta: {
      chartId: 1,
      sliceName: 'Test chart 1',
      height: 1,
      width: 1,
      uuid: '1',
    },
    parents: ['ROOT_ID', 'GRID_ID', 'ROW-6XUMf1rV76'],
    type: 'CHART',
  },
  'CHART-2': {
    children: [],
    id: 'CHART-2',
    meta: {
      chartId: 2,
      sliceName: 'Test chart 2',
      height: 1,
      width: 1,
      uuid: '2',
    },
    parents: ['ROOT_ID', 'GRID_ID', 'ROW-6XUMf1rV76'],
    type: 'CHART',
  },
};

const CHARTS = {
  '1': {
    id: 1,
    form_data: {
      datasource: '2__table',
      viz_type: VizType.Line,
      slice_id: 1,
      color_scheme: 'zobiColors',
    },
    chartAlert: null,
    chartStatus: 'rendered' as const,
    chartUpdateEndTime: 0,
    chartUpdateStartTime: 0,
    lastRendered: 0,
    latestQueryFormData: {},
    sliceFormData: {
      datasource: '2__table',
      viz_type: VizType.Line,
    },
    queryController: null,
    queriesResponse: [{}],
    triggerQuery: false,
  },
  '2': {
    id: 2,
    form_data: {
      color_scheme: 'zobiColors',
      datasource: '2__table',
      viz_type: VizType.Line,
      slice_id: 2,
    },
    chartAlert: null,
    chartStatus: 'rendered' as const,
    chartUpdateEndTime: 0,
    chartUpdateStartTime: 0,
    lastRendered: 0,
    latestQueryFormData: {},
    sliceFormData: {
      datasource: '2__table',
      viz_type: VizType.Line,
    },
    queryController: null,
    queriesResponse: [{}],
    triggerQuery: false,
  },
};

const INITIAL_CHART_CONFIG = {
  '1': {
    id: 1,
    crossFilters: {
      scope: {
        rootPath: ['ROOT_ID'],
        excluded: [1, 2],
      },
      chartsInScope: [],
    },
  },
  '2': {
    id: 2,
    crossFilters: {
      scope: 'global' as const,
      chartsInScope: [1],
    },
  },
};

const GLOBAL_CHART_CONFIG = {
  scope: DEFAULT_CROSS_FILTER_SCOPING,
  chartsInScope: [1, 2],
};

const CHART_CONFIG_METADATA = {
  chart_configuration: INITIAL_CHART_CONFIG,
  global_chart_configuration: GLOBAL_CHART_CONFIG,
};

jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  getChartMetadataRegistry: jest.fn(),
}));

const mockedGetChartMetadataRegistry = getChartMetadataRegistry as jest.Mock;

beforeEach(() => {
  mockedGetChartMetadataRegistry.mockImplementation(() => ({
    get: () => ({
      behaviors: [Behavior.InteractiveChart],
    }),
  }));
});

afterEach(() => {
  mockedGetChartMetadataRegistry.mockRestore();
});

test('Generate correct cross filters configuration without initial configuration', () => {
  // @ts-expect-error
  expect(getCrossFiltersConfiguration(DASHBOARD_LAYOUT, {}, CHARTS)).toEqual({
    chartConfiguration: {
      '1': {
        id: 1,
        crossFilters: {
          scope: 'global',
          chartsInScope: [2],
        },
      },
      '2': {
        id: 2,
        crossFilters: {
          scope: 'global',
          chartsInScope: [1],
        },
      },
    },
    globalChartConfiguration: {
      scope: {
        excluded: [],
        rootPath: ['ROOT_ID'],
      },
      chartsInScope: [1, 2],
    },
  });
});

test('Generate correct cross filters configuration with initial configuration', () => {
  expect(
    getCrossFiltersConfiguration(
      DASHBOARD_LAYOUT,
      CHART_CONFIG_METADATA,
      CHARTS,
    ),
  ).toEqual({
    chartConfiguration: {
      '1': {
        id: 1,
        crossFilters: {
          scope: {
            rootPath: ['ROOT_ID'],
            excluded: [1, 2],
          },
          chartsInScope: [],
        },
      },
      '2': {
        id: 2,
        crossFilters: {
          scope: 'global',
          chartsInScope: [1],
        },
      },
    },
    globalChartConfiguration: {
      scope: {
        excluded: [],
        rootPath: ['ROOT_ID'],
      },
      chartsInScope: [1, 2],
    },
  });
});

test('Recalculate charts in global filter scope when charts change', () => {
  expect(
    getCrossFiltersConfiguration(
      {
        ...DASHBOARD_LAYOUT,
        'CHART-3': {
          children: [],
          id: 'CHART-3',
          meta: {
            chartId: 3,
            sliceName: 'Test chart 3',
            height: 1,
            width: 1,
            uuid: '3',
          },
          parents: ['ROOT_ID', 'GRID_ID', 'ROW-6XUMf1rV76'],
          type: 'CHART',
        },
      },
      CHART_CONFIG_METADATA,
      {
        ...CHARTS,
        '3': {
          id: 3,
          form_data: {
            slice_id: 3,
            datasource: '3__table',
            viz_type: VizType.Line,
            color_scheme: 'zobiColors',
          },
          chartAlert: null,
          chartStatus: 'rendered' as const,
          chartUpdateEndTime: 0,
          chartUpdateStartTime: 0,
          lastRendered: 0,
          latestQueryFormData: {},
          sliceFormData: {
            datasource: '3__table',
            viz_type: VizType.Line,
          },
          queryController: null,
          queriesResponse: [{}],
          triggerQuery: false,
        },
      },
    ),
  ).toEqual({
    chartConfiguration: {
      '1': {
        id: 1,
        crossFilters: {
          scope: { rootPath: ['ROOT_ID'], excluded: [1, 2] },
          chartsInScope: [3],
        },
      },
      '2': {
        id: 2,
        crossFilters: {
          scope: 'global',
          chartsInScope: [1, 3],
        },
      },
      '3': {
        id: 3,
        crossFilters: {
          scope: 'global',
          chartsInScope: [1, 2],
        },
      },
    },
    globalChartConfiguration: {
      scope: {
        excluded: [],
        rootPath: ['ROOT_ID'],
      },
      chartsInScope: [1, 2, 3],
    },
  });
});
