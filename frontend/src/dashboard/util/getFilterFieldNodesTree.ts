import { t } from '@zobi/core/translation';

import { getDashboardFilterKey } from './getDashboardFilterKey';
import { ALL_FILTERS_ROOT } from './constants';
import { DASHBOARD_ROOT_TYPE } from './componentTypes';

interface DashboardFilter {
  chartId: number;
  filterName: string;
  columns: Record<string, unknown>;
  labels: Record<string, string>;
}

interface FilterFieldNode {
  value: string | number;
  label: string;
  type?: string;
  children?: FilterFieldNode[];
  showCheckbox?: boolean;
}

interface GetFilterFieldNodesTreeParams {
  dashboardFilters?: Record<string, DashboardFilter>;
}

export default function getFilterFieldNodesTree({
  dashboardFilters = {},
}: GetFilterFieldNodesTreeParams): FilterFieldNode[] {
  const allFilters = Object.values(dashboardFilters).map(dashboardFilter => {
    const { chartId, filterName, columns, labels } = dashboardFilter;
    const children = Object.keys(columns).map(column => ({
      value: getDashboardFilterKey({ chartId: String(chartId), column }),
      label: labels[column] || column,
    }));
    return {
      value: chartId,
      label: filterName,
      children,
      showCheckbox: true,
    };
  });

  return [
    {
      value: ALL_FILTERS_ROOT,
      type: DASHBOARD_ROOT_TYPE,
      label: t('All filters'),
      children: allFilters,
    },
  ];
}
