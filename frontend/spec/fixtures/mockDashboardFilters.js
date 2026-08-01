import { DASHBOARD_FILTER_SCOPE_GLOBAL } from 'src/dashboard/reducers/dashboardFilters';
import { filterId } from './mockSliceEntities';

export const emptyFilters = {};

export const dashboardFilters = {
  [filterId]: {
    chartId: filterId,
    componentId: 'CHART-rwDfbGqeEn',
    directPathToFilter: [
      'ROOT_ID',
      'TABS-VPEX_c476g',
      'TAB-PMJyKM1yB',
      'TABS-YdylzDMTMQ',
      'TAB-O9AaU9FT0',
      'ROW-l6PrlhwSjh',
      'CHART-rwDfbGqeEn',
    ],
    scopes: {
      region: DASHBOARD_FILTER_SCOPE_GLOBAL,
      gender: DASHBOARD_FILTER_SCOPE_GLOBAL,
    },
    isDateFilter: false,
    isInstantFilter: true,
    columns: {
      region: ['a', 'b'],
    },
    labels: {
      region: 'region',
    },
  },
};
