import { ChartDataResponseResult } from '../../types';

export interface LegacyChartDataResponse extends Omit<
  ChartDataResponseResult,
  'data'
> {
  data: Record<string, unknown>[] | Record<string, unknown>;
}

export default {};
