import newEntitiesFromDrop from 'src/dashboard/util/newEntitiesFromDrop';
import {
  CHART_TYPE,
  DASHBOARD_GRID_TYPE,
  ROW_TYPE,
  TABS_TYPE,
  TAB_TYPE,
} from 'src/dashboard/util/componentTypes';
import type { DropResult } from 'src/dashboard/components/dnd/dragDroppableConfig';
import type { DashboardComponentMap } from 'src/dashboard/types';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('newEntitiesFromDrop', () => {
  test('should return a new Entity of appropriate type, and add it to the drop target children', () => {
    const result = newEntitiesFromDrop({
      dropResult: {
        destination: { id: 'a', type: ROW_TYPE, index: 0 },
        dragging: { id: '', type: CHART_TYPE, meta: {} },
        source: { id: 'b', type: CHART_TYPE, index: 0 },
      } as DropResult,
      layout: {
        a: {
          id: 'a',
          type: ROW_TYPE,
          children: [],
          meta: {},
        },
      } as unknown as DashboardComponentMap,
    });

    const newId = result.a.children[0];
    expect(result.a.children).toHaveLength(1);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result[newId].type).toBe(CHART_TYPE);
  });

  test('should create Tab AND Tabs components if the drag entity is Tabs', () => {
    const result = newEntitiesFromDrop({
      dropResult: {
        destination: { id: 'a', type: DASHBOARD_GRID_TYPE, index: 0 },
        dragging: { id: '', type: TABS_TYPE, meta: {} },
        source: { id: 'b', type: TABS_TYPE, index: 0 },
      } as DropResult,
      layout: {
        a: {
          id: 'a',
          type: DASHBOARD_GRID_TYPE,
          children: [],
          meta: {},
        },
      } as unknown as DashboardComponentMap,
    });

    const newTabsId = result.a.children[0];
    const newTabId = result[newTabsId].children[0];

    expect(result.a.children).toHaveLength(1);
    expect(Object.keys(result)).toHaveLength(3);
    expect(result[newTabsId].type).toBe(TABS_TYPE);
    expect(result[newTabId].type).toBe(TAB_TYPE);
  });

  test('should create a Row if the drag entity should be wrapped in a row', () => {
    const result = newEntitiesFromDrop({
      dropResult: {
        destination: { id: 'a', type: DASHBOARD_GRID_TYPE, index: 0 },
        dragging: { id: '', type: CHART_TYPE, meta: {} },
        source: { id: 'b', type: CHART_TYPE, index: 0 },
      } as DropResult,
      layout: {
        a: {
          id: 'a',
          type: DASHBOARD_GRID_TYPE,
          children: [],
          meta: {},
        },
      } as unknown as DashboardComponentMap,
    });

    const newRowId = result.a.children[0];
    const newChartId = result[newRowId].children[0];

    expect(result.a.children).toHaveLength(1);
    expect(Object.keys(result)).toHaveLength(3);
    const newRow = result[newRowId];
    expect(newRow.type).toBe(ROW_TYPE);
    expect(newRow.parents).toEqual(['a']);
    const newChart = result[newChartId];
    expect(newChart.type).toBe(CHART_TYPE);
    expect(newChart.parents).toEqual(['a', newRowId]);
  });
});
