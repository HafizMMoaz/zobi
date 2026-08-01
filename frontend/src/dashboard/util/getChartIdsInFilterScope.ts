import { NativeFilterScope } from '@zobi.dev/core';
import { CHART_TYPE } from './componentTypes';
import { LayoutItem } from '../types';

interface ExtendedNativeFilterScope extends NativeFilterScope {
  selectedLayers?: string[];
}

export function getChartIdsInFilterScope(
  filterScope: ExtendedNativeFilterScope,
  chartIds: number[],
  layoutItems: LayoutItem[],
): number[] {
  if (filterScope.selectedLayers && filterScope.selectedLayers.length > 0) {
    const targetChartIds: number[] = [];

    filterScope.selectedLayers.forEach(selectionKey => {
      const layerMatch = selectionKey.match(/^chart-(\d+)-layer-(\d+)$/);
      if (layerMatch) {
        const chartId = parseInt(layerMatch[1], 10);
        if (chartIds.includes(chartId) && !targetChartIds.includes(chartId)) {
          targetChartIds.push(chartId);
        }
      }
    });
    const chartsWithLayerSelections = new Set<number>();
    filterScope.selectedLayers.forEach(selectionKey => {
      const layerMatch = selectionKey.match(/^chart-(\d+)-layer-(\d+)$/);
      if (layerMatch) {
        chartsWithLayerSelections.add(parseInt(layerMatch[1], 10));
      }
    });

    const regularChartIds = chartIds.filter(
      chartId =>
        !filterScope.excluded.includes(chartId) &&
        !chartsWithLayerSelections.has(chartId) &&
        layoutItems
          .find(
            layoutItem =>
              layoutItem?.type === CHART_TYPE &&
              layoutItem.meta?.chartId === chartId,
          )
          ?.parents?.some(elementId =>
            filterScope.rootPath.includes(elementId),
          ),
    );

    regularChartIds.forEach(chartId => {
      if (!targetChartIds.includes(chartId)) {
        targetChartIds.push(chartId);
      }
    });
    return targetChartIds;
  }

  const traditionalResult = chartIds.filter(
    chartId =>
      !filterScope.excluded.includes(chartId) &&
      layoutItems
        .find(
          layoutItem =>
            layoutItem?.type === CHART_TYPE &&
            layoutItem.meta?.chartId === chartId,
        )
        ?.parents?.some(elementId => filterScope.rootPath.includes(elementId)),
  );

  return traditionalResult;
}
