import { isEmpty } from 'lodash';
import type { AgGridChartState } from '@zobi.dev/core';

const getInitialFilterModel = (
  chartState?: Partial<AgGridChartState>,
  serverPaginationData?: Record<string, unknown>,
  serverPagination?: boolean,
): Record<string, unknown> | undefined => {
  const chartStateFilterModel =
    chartState?.filterModel && !isEmpty(chartState.filterModel)
      ? (chartState.filterModel as Record<string, unknown>)
      : undefined;

  const serverFilterModel =
    serverPagination &&
    serverPaginationData?.agGridFilterModel &&
    !isEmpty(serverPaginationData.agGridFilterModel)
      ? (serverPaginationData.agGridFilterModel as Record<string, unknown>)
      : undefined;

  return chartStateFilterModel ?? serverFilterModel;
};

export default getInitialFilterModel;
