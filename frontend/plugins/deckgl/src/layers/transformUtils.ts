import { ChartProps } from '@zobi.dev/core';
import { getMapboxApiKey, DataRecord } from './spatialUtils';
import {
  getMetricLabelFromValue,
  FixedOrMetricValue,
} from './utils/metricUtils';

const NOOP = () => {};

export interface BaseHooks {
  onAddFilter: ChartProps['hooks']['onAddFilter'];
  onContextMenu: ChartProps['hooks']['onContextMenu'];
  setControlValue: ChartProps['hooks']['setControlValue'];
  setDataMask: ChartProps['hooks']['setDataMask'];
}

export interface BaseTransformPropsResult {
  datasource: ChartProps['datasource'];
  emitCrossFilters: ChartProps['emitCrossFilters'];
  formData: ChartProps['rawFormData'];
  height: ChartProps['height'];
  onAddFilter: ChartProps['hooks']['onAddFilter'];
  onContextMenu: ChartProps['hooks']['onContextMenu'];
  payload: {
    data: {
      features: unknown[];
      mapboxApiKey: string;
      metricLabels?: string[];
    };
    [key: string]: unknown;
  };
  setControlValue: ChartProps['hooks']['setControlValue'];
  filterState: ChartProps['filterState'];
  viewport: {
    height: number;
    width: number;
    [key: string]: unknown;
  };
  width: ChartProps['width'];
  setDataMask: ChartProps['hooks']['setDataMask'];
  setTooltip: () => void;
}

export function extractHooks(hooks: ChartProps['hooks']): BaseHooks {
  return {
    onAddFilter: hooks?.onAddFilter || NOOP,
    onContextMenu: hooks?.onContextMenu || NOOP,
    setControlValue: hooks?.setControlValue || NOOP,
    setDataMask: hooks?.setDataMask || NOOP,
  };
}

export function createBaseTransformResult(
  chartProps: ChartProps,
  features: unknown[],
  metricLabels?: string[],
): BaseTransformPropsResult {
  const {
    datasource,
    height,
    queriesData,
    rawFormData: formData,
    width,
    filterState,
    emitCrossFilters,
  } = chartProps;

  const hooks = extractHooks(chartProps.hooks);
  const queryData = queriesData[0];

  return {
    datasource,
    emitCrossFilters,
    formData,
    height,
    ...hooks,
    payload: {
      ...queryData,
      data: {
        features,
        mapboxApiKey: getMapboxApiKey(),
        metricLabels: metricLabels || [],
      },
    },
    filterState,
    viewport: {
      ...formData.viewport,
      height,
      width,
    },
    width,
    setTooltip: NOOP,
  };
}

export function getRecordsFromQuery(
  queriesData: ChartProps['queriesData'],
): DataRecord[] {
  return queriesData[0]?.data || [];
}

export function parseMetricValue(value: unknown): number | undefined {
  if (value == null) return undefined;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function addPropertiesToFeature<T extends Record<string, unknown>>(
  feature: T,
  record: DataRecord,
  excludeKeys: Set<string>,
): T {
  const result = { ...feature } as Record<string, unknown>;
  Object.keys(record).forEach(key => {
    if (!excludeKeys.has(key)) {
      result[key] = record[key];
    }
  });
  return result as T;
}

export function getMetricLabelFromFormData(
  metric: string | FixedOrMetricValue | undefined | null,
): string | undefined {
  return getMetricLabelFromValue(metric);
}
