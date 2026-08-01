import { useSelector } from 'react-redux';
import { RootState } from 'src/dashboard/types';

export const useChartIds = () =>
  useSelector<RootState, number[]>(state => state.dashboardState.sliceIds);
