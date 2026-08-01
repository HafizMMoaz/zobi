
import {
  AppliedCrossFilterType,
  Filter,
  NativeFilterType,
} from '@zobi-ui/core';
import { getRelatedCharts } from './getRelatedCharts';

const slices = {
  '1': { datasource: 'ds1', slice_id: 1 },
  '2': { datasource: 'ds2', slice_id: 2 },
  '3': { datasource: 'ds1', slice_id: 3 },
} as any;

test('Return all chart ids in global scope with native filters', () => {
  const filters = {
    filterKey1: {
      filterType: 'filter_select',
      chartsInScope: [1, 2, 3],
      scope: {
        excluded: [],
        rootPath: [],
      },
      targets: [
        {
          column: { name: 'column1' },
          datasetId: 100,
        },
      ],
      type: NativeFilterType.NativeFilter,
    } as unknown as Filter,
  };

  const result = getRelatedCharts('filterKey1', filters.filterKey1, slices);
  expect(result).toEqual([1, 2, 3]);
});

test('Return only chart ids in specific scope with native filters', () => {
  const filters = {
    filterKey1: {
      filterType: 'filter_select',
      chartsInScope: [1, 3],
      scope: {
        excluded: [],
        rootPath: [],
      },
      targets: [
        {
          column: { name: 'column1' },
          datasetId: 100,
        },
      ],
      type: NativeFilterType.NativeFilter,
    } as unknown as Filter,
  };

  const result = getRelatedCharts('filterKey1', filters.filterKey1, slices);
  expect(result).toEqual([1, 3]);
});

test('Return all chart ids with cross filter in global scope', () => {
  const filters = {
    '3': {
      filterType: undefined,
      scope: [1, 2, 3],
      targets: [],
      values: null,
    } as AppliedCrossFilterType,
  };

  const result = getRelatedCharts('3', filters['3'], slices);
  expect(result).toEqual([1, 2]);
});

test('Return only chart ids in specific scope with cross filter', () => {
  const filters = {
    '1': {
      filterType: undefined,
      scope: [1, 2],
      targets: [],
      values: {
        filters: [{ col: 'column3' }],
      },
    } as AppliedCrossFilterType,
  };

  const result = getRelatedCharts('1', filters['1'], slices);
  expect(result).toEqual([2]);
});
