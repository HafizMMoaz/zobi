
import reducer, { getInitialDataMask } from './reducer';
import {
  SET_DATA_MASK_FOR_FILTER_CHANGES_COMPLETE,
  type SetDataMaskForFilterChangesComplete,
} from './actions';
import {
  type ChartCustomization,
  type DataMaskStateWithId,
  type Filter,
  type FilterConfiguration,
  type NativeFilterTarget,
  NativeFilterType,
  ChartCustomizationType,
} from '@zobi.dev/core';
import { HYDRATE_DASHBOARD } from 'src/dashboard/actions/hydrate';

// Helper to create minimal filter for testing
const createFilter = (
  id: string,
  columnName = 'col',
  controlValues = {},
): Filter =>
  ({
    id,
    name: id,
    type: NativeFilterType.NativeFilter,
    scope: { rootPath: [], excluded: [] },
    chartsInScope: [],
    tabsInScope: [],
    controlValues,
    filterType: 'filter_select',
    targets: [{ column: { name: columnName } } as NativeFilterTarget],
    defaultDataMask: { filterState: { value: undefined } },
    cascadeParentIds: [],
    description: '',
  }) satisfies Partial<Filter> as Filter;

// Helper to create action for filter modification
const createModifyAction = (
  modifiedFilter: Filter,
  oldFilters = {},
): SetDataMaskForFilterChangesComplete => ({
  type: SET_DATA_MASK_FOR_FILTER_CHANGES_COMPLETE,
  filterChanges: {
    deleted: [],
    reordered: [],
    modified: [modifiedFilter],
  },
  filters: oldFilters,
});

test('when user edits a filter and changes targets, other filters maintain their selected values', () => {
  const initialState: DataMaskStateWithId = {
    'NATIVE_FILTER-1': {
      id: 'NATIVE_FILTER-1',
      ...getInitialDataMask('NATIVE_FILTER-1'),
      filterState: { value: ['foo'] },
    },
    'NATIVE_FILTER-2': {
      id: 'NATIVE_FILTER-2',
      ...getInitialDataMask('NATIVE_FILTER-2'),
      filterState: { value: ['bar'] },
    },
  };

  const action = createModifyAction(
    createFilter('NATIVE_FILTER-1', 'col_changed'),
  );

  const result = reducer(initialState, action);

  expect(result['NATIVE_FILTER-2']?.filterState?.value).toEqual(['bar']);
  expect(result['NATIVE_FILTER-1']?.filterState?.value).toBeUndefined();
});

test('when user edits a filter without changing targets, their selection is preserved', () => {
  const initialState: DataMaskStateWithId = {
    'NATIVE_FILTER-1': {
      id: 'NATIVE_FILTER-1',
      ...getInitialDataMask('NATIVE_FILTER-1'),
      extraFormData: { time_range: '1 year ago' },
      filterState: { value: ['foo'] },
    },
  };

  const oldFilters = {
    'NATIVE_FILTER-1': createFilter('NATIVE_FILTER-1', 'col_a', {
      enableEmptyFilter: true,
    }),
  };

  const action = createModifyAction(
    createFilter('NATIVE_FILTER-1', 'col_a', { enableEmptyFilter: true }),
    oldFilters,
  );

  const result = reducer(initialState, action);

  expect(result['NATIVE_FILTER-1']?.filterState?.value).toEqual(['foo']);
  expect(result['NATIVE_FILTER-1']?.extraFormData?.time_range).toEqual(
    '1 year ago',
  );
});

// Runtime data from the server can contain null entries in
// chart_customization_config even though the TS type does not include | null
// yet. These helpers build HYDRATE_DASHBOARD actions that mirror that reality.
function hydrateAction(
  chartCustomizationConfig: unknown[],
  nativeFilterConfig: FilterConfiguration = [],
) {
  return {
    type: HYDRATE_DASHBOARD as typeof HYDRATE_DASHBOARD,
    data: {
      dashboardInfo: {
        metadata: {
          native_filter_configuration: nativeFilterConfig,
          chart_customization_config:
            chartCustomizationConfig as ChartCustomization[],
        },
      },
      dataMask: {},
    },
  };
}

test('HYDRATE_DASHBOARD filters null entries from chart_customization_config', () => {
  const customizationId = 'CHART_CUSTOMIZATION-group-1';
  const action = hydrateAction([
    null,
    {
      id: customizationId,
      type: ChartCustomizationType.ChartCustomization,
      name: 'Dynamic Group By',
      filterType: 'chart_customization_dynamic_groupby',
      targets: [{ datasetId: 1, column: { name: 'status' } }],
      scope: { rootPath: ['ROOT_ID'], excluded: [] },
      chartsInScope: [10],
      defaultDataMask: {
        extraFormData: {},
        filterState: { value: ['status'] },
      },
      controlValues: {},
      cascadeParentIds: [],
      description: '',
    },
    null,
  ]);

  const result = reducer({}, action);

  expect(result[customizationId]).toBeDefined();
  expect(result[customizationId].filterState?.value).toEqual(['status']);
});

test('HYDRATE_DASHBOARD handles chart_customization_config that is entirely null', () => {
  const action = hydrateAction([null, null]);

  const result = reducer({}, action);

  // Should not crash; no customization keys should appear
  const customizationKeys = Object.keys(result).filter(k =>
    k.startsWith('CHART_CUSTOMIZATION'),
  );
  expect(customizationKeys).toHaveLength(0);
});
