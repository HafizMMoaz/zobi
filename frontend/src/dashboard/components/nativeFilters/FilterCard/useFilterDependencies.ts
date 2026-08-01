import { ensureIsArray, Filter } from '@zobi-ui/core';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/dashboard/types';
import { FilterElement } from '../FilterBar/FilterControls/types';

const EMPTY_ARRAY: Filter[] = [];

const makeSelectFilterDependencies = (filterDependencyIds: string[]) =>
  createSelector(
    (state: RootState) => state.nativeFilters.filters,
    (filters): Filter[] => {
      if (filterDependencyIds.length === 0) {
        return EMPTY_ARRAY;
      }
      return filterDependencyIds
        .map(id => filters[id] as Filter)
        .filter(Boolean);
    },
  );

export const useFilterDependencies = (filter: FilterElement) => {
  const filterDependencyIds = ensureIsArray(filter.cascadeParentIds ?? []);

  const selectFilterDependencies = useMemo(
    () => makeSelectFilterDependencies(filterDependencyIds),
    [filterDependencyIds.join(',')],
  );

  return useSelector(selectFilterDependencies);
};
