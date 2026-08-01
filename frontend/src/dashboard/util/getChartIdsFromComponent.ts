import { CHART_TYPE } from './componentTypes';
import type { DashboardLayout } from '../types';

export default function getChartIdsFromComponent(
  componentId: string,
  layout: DashboardLayout,
): number[] {
  const chartIds: number[] = [];
  const component = layout[componentId];

  if (!component) return chartIds;

  // If this component is a chart, add its ID
  if (component.type === CHART_TYPE && component.meta?.chartId) {
    chartIds.push(component.meta.chartId);
  }

  // Recursively check children
  if (component.children) {
    component.children.forEach((childId: string) => {
      chartIds.push(...getChartIdsFromComponent(childId, layout));
    });
  }

  return chartIds;
}
