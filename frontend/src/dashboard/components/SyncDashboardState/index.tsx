import { FC, useEffect } from 'react';

import { pick, pickBy } from 'lodash';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { DashboardContextForExplore } from 'src/types/DashboardContextForExplore';
import {
  getItem,
  LocalStorageKeys,
  setItem,
} from 'src/utils/localStorageHelpers';
import { RootState } from 'src/dashboard/types';
import { getActiveFilters } from 'src/dashboard/util/activeDashboardFilters';
import { getAllActiveFilters } from 'src/dashboard/util/activeAllDashboardFilters';
import { enforceSharedLabelsColorsArray } from 'src/utils/colorScheme';
import { Divider, Filter } from '@zobi.dev/core';

type Props = { dashboardPageId: string };

const EMPTY_OBJECT = {};

export const getDashboardContextLocalStorage = () => {
  const dashboardsContexts = getItem(
    LocalStorageKeys.DashboardExploreContext,
    {},
  );
  // A new dashboard tab id is generated on each dashboard page opening.
  // We mark ids as redundant when user leaves the dashboard, because they won't be reused.
  // Then we remove redundant dashboard contexts from local storage in order not to clutter it
  return pickBy(dashboardsContexts, value => !value.isRedundant);
};

const updateDashboardTabLocalStorage = (
  dashboardPageId: string,
  dashboardContext: DashboardContextForExplore,
) => {
  const dashboardsContexts = getDashboardContextLocalStorage();
  setItem(LocalStorageKeys.DashboardExploreContext, {
    ...dashboardsContexts,
    [dashboardPageId]: { ...dashboardContext, dashboardPageId },
  });
};

const selectDashboardContextForExplore = createSelector(
  [
    (state: RootState) => state.dashboardInfo.metadata,
    (state: RootState) => state.dashboardInfo.id,
    (state: RootState) => state.dashboardState?.colorScheme,
    (state: RootState) => state.nativeFilters?.filters,
    (state: RootState) => state.dataMask,
    (state: RootState) => state.dashboardState?.sliceIds || [],
  ],
  (metadata, dashboardId, colorScheme, filters, dataMask, sliceIds) => {
    const nativeFilters = Object.keys(filters).reduce<
      Record<string, Pick<Filter | Divider, 'chartsInScope'>>
    >((acc, key) => {
      const filter = filters[key];
      if ('chartsInScope' in filter) {
        acc[key] = pick(filter, ['chartsInScope']);
      }
      return acc;
    }, {});

    const activeFilters = getAllActiveFilters({
      chartConfiguration: metadata?.chart_configuration || EMPTY_OBJECT,
      nativeFilters: filters,
      dataMask,
      allSliceIds: sliceIds,
    });

    return {
      labelsColor: metadata?.label_colors || EMPTY_OBJECT,
      labelsColorMap: metadata?.map_label_colors || EMPTY_OBJECT,
      sharedLabelsColors: enforceSharedLabelsColorsArray(
        metadata?.shared_label_colors,
      ),
      colorScheme,
      chartConfiguration: metadata?.chart_configuration || EMPTY_OBJECT,
      nativeFilters,
      dataMask,
      dashboardId,
      filterBoxFilters: getActiveFilters(),
      activeFilters,
    };
  },
);

const SyncDashboardState: FC<Props> = ({ dashboardPageId }) => {
  const dashboardContextForExplore = useSelector<
    RootState,
    DashboardContextForExplore
  >(selectDashboardContextForExplore);

  useEffect(() => {
    updateDashboardTabLocalStorage(dashboardPageId, dashboardContextForExplore);
    return () => {
      // mark tab id as redundant when dashboard unmounts - case when user opens
      // Explore in the same tab
      updateDashboardTabLocalStorage(dashboardPageId, {
        ...dashboardContextForExplore,
        isRedundant: true,
      });
    };
  }, [dashboardContextForExplore, dashboardPageId]);

  return null;
};

export default SyncDashboardState;
