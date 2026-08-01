import {
  DASHBOARD_GRID_TYPE,
  HEADER_TYPE,
  DASHBOARD_ROOT_TYPE,
} from '../util/componentTypes';

import {
  DASHBOARD_ROOT_ID,
  DASHBOARD_HEADER_ID,
  DASHBOARD_GRID_ID,
} from '../util/constants';

import type { DashboardLayout, LayoutItemMeta } from '../types';

// Create minimal meta objects that satisfy the LayoutItemMeta type requirements
const rootMeta: LayoutItemMeta = {
  chartId: 0,
  height: 0,
  uuid: '',
  width: 0,
};

const gridMeta: LayoutItemMeta = {
  chartId: 0,
  height: 0,
  uuid: '',
  width: 0,
};

const headerMeta: LayoutItemMeta = {
  chartId: 0,
  height: 0,
  uuid: '',
  width: 0,
  text: 'New dashboard',
};

const emptyDashboardLayout: DashboardLayout = {
  [DASHBOARD_ROOT_ID]: {
    type: DASHBOARD_ROOT_TYPE,
    id: DASHBOARD_ROOT_ID,
    children: [DASHBOARD_GRID_ID],
    parents: [],
    meta: rootMeta,
  },

  [DASHBOARD_GRID_ID]: {
    type: DASHBOARD_GRID_TYPE,
    id: DASHBOARD_GRID_ID,
    children: [],
    parents: [DASHBOARD_ROOT_ID],
    meta: gridMeta,
  },

  [DASHBOARD_HEADER_ID]: {
    type: HEADER_TYPE,
    id: DASHBOARD_HEADER_ID,
    children: [],
    parents: [],
    meta: headerMeta,
  },
};

export default emptyDashboardLayout;
