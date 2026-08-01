/* eslint-disable no-param-reassign */
import { CHART_TYPE } from './componentTypes';
import type { DashboardLayout, LayoutItem } from '../types';

export default function getLayoutComponentFromChartId(
  layout: DashboardLayout,
  chartId: number,
): LayoutItem | undefined {
  return Object.values(layout).find(
    currentComponent =>
      currentComponent &&
      currentComponent.type === CHART_TYPE &&
      currentComponent.meta &&
      currentComponent.meta.chartId === chartId,
  );
}
