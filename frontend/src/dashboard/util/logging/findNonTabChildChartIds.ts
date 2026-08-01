import { Layout, LayoutItem } from 'src/dashboard/types';
import { TABS_TYPE, CHART_TYPE } from '../componentTypes';

interface FindNonTabChildChartIdsParams {
  id: string;
  layout: Layout;
}

// This function traverses the layout from the passed id, returning an array
// of any child chartIds NOT nested within a Tabs component. These helps us identify
// if the charts at a given "Tabs" level are loaded
function findNonTabChildChartIds({
  id,
  layout,
}: FindNonTabChildChartIdsParams): number[] {
  const chartIds: number[] = [];
  function recurseFromNode(node: LayoutItem | undefined): void {
    if (node && node.type === CHART_TYPE) {
      if (node.meta && node.meta.chartId) {
        chartIds.push(node.meta.chartId);
      }
    } else if (
      node &&
      node.type !== TABS_TYPE &&
      node.children &&
      node.children.length
    ) {
      node.children.forEach(childId => {
        const child = layout[childId];
        if (child) {
          recurseFromNode(child);
        }
      });
    }
  }

  recurseFromNode(layout[id]);

  return chartIds;
}

// This method is called frequently, so cache results
let cachedLayout: Layout | undefined;
let cachedIdsLookup: Record<string, number[]> = {};
export default function findNonTabChildChartIdsWithCache({
  id,
  layout,
}: FindNonTabChildChartIdsParams): number[] {
  if (cachedLayout === layout && id in cachedIdsLookup) {
    return cachedIdsLookup[id];
  }
  if (layout !== cachedLayout) {
    cachedLayout = layout;
    cachedIdsLookup = {};
  }
  cachedIdsLookup[id] = findNonTabChildChartIds({ layout, id });
  return cachedIdsLookup[id];
}
