import getLayoutComponentFromChartId from './getLayoutComponentFromChartId';
import { CHART_TYPE, DASHBOARD_ROOT_TYPE } from './componentTypes';
import type { DashboardLayout, LayoutItem } from '../types';

const mockLayoutItem: LayoutItem = {
  id: 'CHART-123',
  type: CHART_TYPE,
  children: [],
  meta: {
    chartId: 456,
    defaultText: '',
    height: 400,
    placeholder: '',
    sliceName: 'Test Chart',
    text: '',
    uuid: 'abc-def-ghi',
    width: 400,
  },
};

const mockRootLayoutItem: LayoutItem = {
  id: 'ROOT_ID',
  type: DASHBOARD_ROOT_TYPE,
  children: ['CHART-123'],
  meta: {
    chartId: 0,
    defaultText: '',
    height: 0,
    placeholder: '',
    text: '',
    uuid: 'root-uuid',
    width: 0,
  },
};

const mockLayout: DashboardLayout = {
  'CHART-123': mockLayoutItem,
  ROOT_ID: mockRootLayoutItem,
};

test('should find layout component by chart ID', () => {
  const result = getLayoutComponentFromChartId(mockLayout, 456);
  expect(result).toEqual(mockLayoutItem);
});

test('should return undefined when chart ID is not found', () => {
  const result = getLayoutComponentFromChartId(mockLayout, 999);
  expect(result).toBeUndefined();
});

test('should return undefined when layout is empty', () => {
  const result = getLayoutComponentFromChartId({}, 456);
  expect(result).toBeUndefined();
});

test('should ignore non-chart components', () => {
  const layoutWithoutChart: DashboardLayout = {
    ROOT_ID: mockRootLayoutItem,
  };

  const result = getLayoutComponentFromChartId(layoutWithoutChart, 456);
  expect(result).toBeUndefined();
});

test('should handle components without meta', () => {
  const componentWithoutMeta: LayoutItem = {
    id: 'NO-META',
    type: CHART_TYPE,
    children: [],
    meta: {
      chartId: 0,
      defaultText: '',
      height: 0,
      placeholder: '',
      text: '',
      uuid: 'no-meta-uuid',
      width: 0,
    },
  };

  const layoutWithoutMeta: DashboardLayout = {
    'NO-META': componentWithoutMeta,
  };

  const result = getLayoutComponentFromChartId(layoutWithoutMeta, 456);
  expect(result).toBeUndefined();
});
