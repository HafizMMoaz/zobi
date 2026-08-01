
import { useCallback, useMemo } from 'react';
import {
  DataMask,
  DataMaskStateWithId,
  Divider,
  Filter,
  isFilterDivider,
} from '@zobi-ui/core';
import { FilterBarOrientation } from 'src/dashboard/types';
import FilterControl from './FilterControls/FilterControl';
import { useFilters } from './state';
import FilterDivider from './FilterControls/FilterDivider';

export const useFilterControlFactory = (
  dataMaskSelected: DataMaskStateWithId,
  onFilterSelectionChange: (filter: Filter, dataMask: DataMask) => void,
  clearAllTriggers?: Record<string, boolean>,
  onClearAllComplete?: (filterId: string) => void,
) => {
  const filters = useFilters();
  const filterValues = useMemo(
    () => Object.values(filters) as (Filter | Divider)[],
    [filters],
  );
  const filtersWithValues: (Filter | Divider)[] = useMemo(
    () =>
      filterValues.map(filter => ({
        ...filter,
        dataMask: dataMaskSelected[filter.id],
      })),
    [filterValues, dataMaskSelected],
  );

  const filterControlFactory = useCallback(
    (
      index: number,
      filterBarOrientation: FilterBarOrientation,
      overflow: boolean,
    ) => {
      const filter = filtersWithValues[index];
      if (isFilterDivider(filter)) {
        return (
          <FilterDivider
            title={filter.title}
            description={filter.description}
            orientation={filterBarOrientation}
            overflow={overflow}
          />
        );
      }
      return (
        <FilterControl
          dataMaskSelected={dataMaskSelected}
          filter={filter}
          onFilterSelectionChange={onFilterSelectionChange}
          inView={false}
          orientation={filterBarOrientation}
          overflow={overflow}
          clearAllTrigger={clearAllTriggers?.[filter.id]}
          onClearAllComplete={() => onClearAllComplete?.(filter.id)}
        />
      );
    },
    [
      filtersWithValues,
      dataMaskSelected,
      onFilterSelectionChange,
      clearAllTriggers,
      onClearAllComplete,
    ],
  );

  return { filterControlFactory, filtersWithValues };
};
