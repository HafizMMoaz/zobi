import getChartIdsFromLayout from 'src/dashboard/util/getChartIdsFromLayout';
import { ROW_TYPE, CHART_TYPE } from 'src/dashboard/util/componentTypes';
import type { DashboardLayout } from '../types';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getChartIdsFromLayout', () => {
  const mockLayout: DashboardLayout = {
    a: {
      id: 'a',
      type: CHART_TYPE,
      children: [],
      meta: {
        chartId: 123,
        height: 400,
        width: 400,
        uuid: 'uuid-a',
      },
    },
    b: {
      id: 'b',
      type: CHART_TYPE,
      children: [],
      meta: {
        chartId: 456,
        height: 400,
        width: 400,
        uuid: 'uuid-b',
      },
    },
    c: {
      id: 'c',
      type: ROW_TYPE,
      children: [],
      meta: {
        chartId: 789,
        height: 400,
        width: 400,
        uuid: 'uuid-c',
      },
    },
  };

  test('should return an array of chartIds', () => {
    const result = getChartIdsFromLayout(mockLayout);
    expect(Array.isArray(result)).toBe(true);
    expect(result.includes(123)).toBe(true);
    expect(result.includes(456)).toBe(true);
  });

  test('should return ids only from CHART_TYPE components', () => {
    const result = getChartIdsFromLayout(mockLayout);
    expect(result).toHaveLength(2);
    expect(result.includes(789)).toBe(false);
  });
});
