/* eslint-disable no-param-reassign */
import { useSelector } from 'react-redux';
import {
  DataMaskState,
  DataMaskStateWithId,
  DataMaskWithId,
  Divider,
  Filter,
  Filters,
} from '@zobi.dev/core';
import { useEffect, useMemo, useState } from 'react';
import { ChartsState, RootState } from 'src/dashboard/types';
import {
  NATIVE_FILTER_PREFIX,
  CHART_CUSTOMIZATION_PREFIX,
  LEGACY_GROUPBY_PREFIX,
  isNativeFilter,
} from '../FiltersConfigModal/utils';
import { useFilterConfiguration } from '../state';

export const useFilters = () => {
  const preselectedNativeFilters = useSelector<any, Filters>(
    state => state.dashboardState?.preselectNativeFilters,
  );
  const filterConfiguration = useFilterConfiguration();

  return useMemo(
    () =>
      filterConfiguration.reduce(
        // FilterConfiguration is Array<Filter | Divider>, so the accumulator
        // must accept dividers too, not just filters.
        (acc, filter: Filter | Divider) => ({
          ...acc,
          [filter.id]: {
            ...filter,
            preselect: preselectedNativeFilters?.[filter.id],
          },
        }),
        {} as Filters,
      ),
    [filterConfiguration, preselectedNativeFilters],
  );
};

export const useNativeFiltersDataMask = () => {
  const dataMask = useSelector<RootState, DataMaskStateWithId>(
    state => state.dataMask,
  );

  const filteredMask = useMemo(
    () =>
      Object.values(dataMask)
        .filter((item: DataMaskWithId) => isNativeFilter(String(item.id)))
        .reduce(
          (prev, next: DataMaskWithId) => ({ ...prev, [next.id]: next }),
          {},
        ) as DataMaskStateWithId,
    [dataMask],
  );

  return filteredMask;
};

export const useAllAppliedDataMask = () => {
  const dataMask = useSelector<RootState, DataMaskStateWithId>(
    state => state.dataMask,
  );

  const allAppliedMask = useMemo(
    () =>
      Object.values(dataMask)
        .filter((item: DataMaskWithId) => {
          const id = String(item.id);
          return (
            id.startsWith(NATIVE_FILTER_PREFIX) ||
            id.startsWith(CHART_CUSTOMIZATION_PREFIX) ||
            id.startsWith(LEGACY_GROUPBY_PREFIX)
          );
        })
        .reduce(
          (prev, next: DataMaskWithId) => ({ ...prev, [next.id]: next }),
          {},
        ) as DataMaskStateWithId,
    [dataMask],
  );

  return allAppliedMask;
};

export const useFilterUpdates = (
  dataMaskSelected: DataMaskState,
  setDataMaskSelected: (arg0: (arg0: DataMaskState) => void) => void,
) => {
  const filters = useFilters();
  const dataMaskApplied = useNativeFiltersDataMask();
  useEffect(() => {
    Object.keys(dataMaskSelected).forEach(selectedId => {
      const isChartCustomizationItem =
        String(selectedId).startsWith(CHART_CUSTOMIZATION_PREFIX) ||
        String(selectedId).startsWith(LEGACY_GROUPBY_PREFIX);
      if (!isChartCustomizationItem && !filters[selectedId]) {
        setDataMaskSelected(draft => {
          delete draft[selectedId];
        });
      }
    });
  }, [dataMaskApplied, dataMaskSelected, filters, setDataMaskSelected]);
};

// Load filters after charts loaded
export const useInitialization = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const filters = useFilters();
  const charts = useSelector<RootState, ChartsState>(state => state.charts);

  // We need to know how much charts now shown on dashboard to know how many of all charts should be loaded
  let numberOfLoadingCharts = 0;
  if (!isInitialized) {
    numberOfLoadingCharts = document.querySelectorAll(
      '[data-ui-anchor="chart"]',
    ).length;
  }
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    if (
      Object.values(filters).some(
        filter => 'requiredFirst' in filter && filter.requiredFirst,
      )
    ) {
      setIsInitialized(true);
      return;
    }

    // For some dashboards may be there are no charts on first page,
    // so we check up to 1 sec if there is at least on chart to load
    let filterTimeout: NodeJS.Timeout;
    if (numberOfLoadingCharts === 0) {
      filterTimeout = setTimeout(() => {
        setIsInitialized(true);
      }, 1000);
    }

    // @ts-expect-error
    if (numberOfLoadingCharts > 0 && filterTimeout !== undefined) {
      clearTimeout(filterTimeout);
    }

    const numberOfLoadedCharts = Object.values(charts).filter(
      ({ chartStatus }) => chartStatus !== 'loading',
    ).length;
    if (
      numberOfLoadingCharts > 0 &&
      numberOfLoadedCharts >= numberOfLoadingCharts
    ) {
      setIsInitialized(true);
    }
  }, [charts, isInitialized, numberOfLoadingCharts]);

  return isInitialized;
};
