import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/dashboard/types';
import getChartAndLabelComponentIdFromPath from 'src/dashboard/util/getChartAndLabelComponentIdFromPath';

const filterOutlinedSelector = createSelector(
  [
    (state: RootState) => state.dashboardState.directPathToChild,
    (state: RootState) => state.dashboardState.directPathLastUpdated,
  ],
  (directPathToChild, directPathLastUpdated) => ({
    outlinedFilterId: (
      getChartAndLabelComponentIdFromPath(directPathToChild || []) as Record<
        string,
        string
      >
    )?.native_filter,
    lastUpdated: directPathLastUpdated,
  }),
);
export const useFilterOutlined = () =>
  useSelector<RootState, { outlinedFilterId: string; lastUpdated: number }>(
    filterOutlinedSelector,
  );
