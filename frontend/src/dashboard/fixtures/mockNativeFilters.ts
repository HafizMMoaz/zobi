import {
  DataMaskStateWithId,
  NativeFiltersState,
  NativeFilterType,
} from '@zobi.dev/core';

export const mockDataMaskInfo: DataMaskStateWithId = {
  DefaultsID: {
    id: 'DefaultId',
    ownState: {},
    filterState: {
      value: [],
    },
  },
};

export const nativeFiltersInfo: NativeFiltersState = {
  filters: {
    DefaultsID: {
      cascadeParentIds: [],
      id: 'DefaultsID',
      name: 'test',
      filterType: 'filter_select',
      chartsInScope: [],
      targets: [
        {
          datasetId: 0,
          column: {
            name: 'test column',
            displayName: 'test column',
          },
        },
      ],
      defaultDataMask: {
        filterState: {
          value: null,
        },
      },
      scope: {
        rootPath: [],
        excluded: [],
      },
      controlValues: {
        allowsMultipleValues: true,
        isRequired: false,
      },
      type: NativeFilterType.NativeFilter,
      description: 'test description',
    },
  },
};
