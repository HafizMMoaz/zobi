import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { URL_PARAMS } from 'src/constants';
import { getUrlParam } from 'src/utils/urlUtils';
import { RootState } from 'src/dashboard/types';
import { isFeatureEnabled, FeatureFlag } from '@zobi-ui/core';
import {
  useFilters,
  useNativeFiltersDataMask,
} from '../nativeFilters/FilterBar/state';
import { useChartCustomizationFromRedux } from '../nativeFilters/state';
import { toggleNativeFiltersBar } from '../../actions/dashboardState';

export const useNativeFilters = () => {
  const dispatch = useDispatch();

  const [isInitialized, setIsInitialized] = useState(false);

  const showNativeFilters = useSelector<RootState, boolean>(
    () => getUrlParam(URL_PARAMS.showFilters) ?? true,
  );
  const canEdit = useSelector<RootState, boolean>(
    ({ dashboardInfo }) => dashboardInfo.dash_edit_perm,
  );
  const dashboardFiltersOpen = useSelector<RootState, boolean>(
    state => state.dashboardState.nativeFiltersBarOpen ?? false,
  );

  const filters = useFilters();
  const filterValues = useMemo(() => Object.values(filters), [filters]);
  const expandFilters = getUrlParam(URL_PARAMS.expandFilters);
  const chartCustomizations = useChartCustomizationFromRedux();

  const nativeFiltersEnabled =
    showNativeFilters &&
    (canEdit ||
      (!canEdit &&
        (filterValues.length !== 0 || chartCustomizations.length !== 0)));

  const requiredFirstFilter = useMemo(
    () =>
      filterValues.filter(
        filter =>
          'requiredFirst' in filter &&
          filter.requiredFirst === true &&
          filter.filterType !== 'filter_time',
      ),
    [filterValues],
  );
  const dataMask = useNativeFiltersDataMask();

  const missingInitialFilters = useMemo(
    () =>
      requiredFirstFilter
        .filter(({ id }) => dataMask[id]?.filterState?.value === undefined)
        .map(({ name }) => name),
    [requiredFirstFilter, dataMask],
  );

  const showDashboard =
    isInitialized ||
    !nativeFiltersEnabled ||
    missingInitialFilters.length === 0;

  const toggleDashboardFiltersOpen = useCallback(
    (visible?: boolean) => {
      const newState = visible ?? !dashboardFiltersOpen;
      dispatch(toggleNativeFiltersBar(newState));
    },
    [dispatch, dashboardFiltersOpen],
  );

  useEffect(() => {
    if (
      (isFeatureEnabled(FeatureFlag.FilterBarClosedByDefault) &&
        expandFilters === null) ||
      expandFilters === false ||
      (filterValues.length === 0 &&
        chartCustomizations.length === 0 &&
        nativeFiltersEnabled)
    ) {
      dispatch(toggleNativeFiltersBar(false));
    } else {
      dispatch(toggleNativeFiltersBar(true));
    }
  }, [
    dispatch,
    filterValues.length,
    chartCustomizations.length,
    expandFilters,
    nativeFiltersEnabled,
  ]);

  useEffect(() => {
    if (showDashboard) {
      setIsInitialized(true);
    }
  }, [showDashboard]);

  return {
    showDashboard,
    missingInitialFilters,
    dashboardFiltersOpen,
    toggleDashboardFiltersOpen,
    nativeFiltersEnabled,
  };
};
