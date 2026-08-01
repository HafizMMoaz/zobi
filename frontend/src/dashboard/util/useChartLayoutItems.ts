import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '../types';
import { CHART_TYPE } from './componentTypes';

const chartLayoutItemsSelector = createSelector(
  (state: RootState) => state.dashboardLayout.present,
  layout => Object.values(layout).filter(item => item?.type === CHART_TYPE),
);

export const useChartLayoutItems = () => useSelector(chartLayoutItemsSelector);
