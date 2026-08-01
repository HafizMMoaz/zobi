import {
  DASHBOARD_GRID_ID,
  DASHBOARD_ROOT_ID,
} from 'src/dashboard/util/constants';
import { DashboardLayout } from 'src/dashboard/types';

export const getRootLevelTabsComponent = (dashboardLayout: DashboardLayout) => {
  const dashboardRoot = dashboardLayout[DASHBOARD_ROOT_ID];
  const rootChildId = dashboardRoot?.children[0];
  return rootChildId === DASHBOARD_GRID_ID
    ? dashboardLayout[DASHBOARD_ROOT_ID]
    : dashboardLayout[rootChildId];
};

export const shouldFocusTabs = (
  event: { target: { className: string } },
  container: { contains: (arg0: any) => any },
) =>
  // don't focus the tabs when we click on a tab
  event.target.className === 'ant-tabs-nav-wrap' ||
  container.contains(event.target);
