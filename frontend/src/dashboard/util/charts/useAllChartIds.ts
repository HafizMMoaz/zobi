import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { RootState } from 'src/dashboard/types';
import getChartIdsFromLayout from '../getChartIdsFromLayout';

export const useAllChartIds = () => {
  const layout = useSelector(
    (state: RootState) => state.dashboardLayout.present,
  );
  return useMemo(() => getChartIdsFromLayout(layout), [layout]);
};
