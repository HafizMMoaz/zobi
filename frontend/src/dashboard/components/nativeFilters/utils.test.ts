import { Behavior } from '@zobi-ui/core';
import { DashboardLayout } from 'src/dashboard/types';
import { CHART_TYPE } from 'src/dashboard/util/componentTypes';
import {
  nativeFilterGate,
  findTabsWithChartsInScope,
  getFormData,
} from './utils';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('nativeFilterGate', () => {
  test('should return true for regular chart', () => {
    expect(nativeFilterGate([])).toEqual(true);
  });

  test('should return true for cross filter chart', () => {
    expect(nativeFilterGate([Behavior.InteractiveChart])).toEqual(true);
  });

  test('should return true for native filter chart with cross filter support', () => {
    expect(
      nativeFilterGate([Behavior.NativeFilter, Behavior.InteractiveChart]),
    ).toEqual(true);
  });

  test('should return false for native filter behavior', () => {
    expect(nativeFilterGate([Behavior.NativeFilter])).toEqual(false);
  });
});

test('findTabsWithChartsInScope should handle a recursive layout structure', () => {
  const dashboardLayout = {
    DASHBOARD_VERSION_KEY: 'v2',
    ROOT_ID: {
      children: ['GRID_ID'],
      id: 'ROOT_ID',
      type: 'ROOT',
    },
    GRID_ID: {
      children: ['TAB-LrujeuD5Qn', 'TABS-kN7tw6vFif'],
      id: 'GRID_ID',
      parents: ['ROOT_ID'],
      type: 'GRID',
    },
    'TAB-LrujeuD5Qn': {
      children: ['TABS-kN7tw6vFif'],
      id: 'TAB-LrujeuD5Qn',
      meta: {
        text: 'View by Totals',
      },
      parents: ['ROOT_ID'],
      type: 'TAB',
    },
    'TABS-kN7tw6vFif': {
      children: ['TAB-LrujeuD5Qn', 'TAB--7BUkKkNl'],
      id: 'TABS-kN7tw6vFif',
      meta: {},
      parents: ['ROOT_ID'],
      type: 'TABS',
    },
  } as any as DashboardLayout;

  const chartLayoutItems = Object.values(dashboardLayout).filter(
    item => item.type === CHART_TYPE,
  );
  expect(Array.from(findTabsWithChartsInScope(chartLayoutItems, []))).toEqual(
    [],
  );
});

test('getFormData should include persisted time_grains for time grain filters', () => {
  const formData = getFormData({
    dashboardId: 10,
    id: 'NATIVE_FILTER-1',
    filterType: 'filter_timegrain',
    type: 'NATIVE_FILTER' as any,
    controlValues: {},
    defaultDataMask: {},
    datasetId: 11,
    time_grains: ['PT1H', 'P1D', 'P1W'],
  });

  expect((formData as any).time_grains).toEqual(['PT1H', 'P1D', 'P1W']);
});
