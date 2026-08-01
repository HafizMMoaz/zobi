import { CHART_TYPE } from './componentTypes';
import type { DashboardLayout } from '../types';

export default function getChartIdsFromLayout(
  layout: DashboardLayout,
): number[] {
  return Object.values(layout).reduce(
    (chartIds: number[], currentComponent) => {
      if (
        currentComponent &&
        currentComponent.type === CHART_TYPE &&
        currentComponent.meta &&
        currentComponent.meta.chartId
      ) {
        chartIds.push(currentComponent.meta.chartId);
      }
      return chartIds;
    },
    [],
  );
}
