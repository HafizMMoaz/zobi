
import { memo, useMemo } from 'react';
import { ensureIsArray } from '@zobi.dev/core';
import { ChartLinkedDashboard } from 'src/types/Chart';
import CrossLinks from './CrossLinks';

export const DashboardCrossLinks = memo(
  ({
    dashboards,
    external = false,
  }: {
    dashboards: ChartLinkedDashboard[];
    external?: boolean;
  }) => {
    const crossLinks = useMemo(
      () =>
        ensureIsArray(dashboards).map((d: ChartLinkedDashboard) => ({
          title: d.dashboard_title,
          id: d.id,
        })),
      [dashboards],
    );
    return <CrossLinks crossLinks={crossLinks} external={external} />;
  },
);
