import makeApi from './makeApi';
import { ChartDataResponse, QueryContext } from '../../types';

export const getChartData = makeApi<QueryContext, ChartDataResponse>({
  method: 'POST',
  endpoint: '/api/v1/chart/data',
});

/**
 * All v1 API
 */
export default {
  getChartData,
};
