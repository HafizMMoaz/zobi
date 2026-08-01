import {
  buildQueryContext,
  ensureIsArray,
  getMetricLabel,
  QueryFormMetric,
  QueryFormOrderBy,
  SqlaFormData,
  QueryFormColumn,
  QueryObject,
} from '@zobi.dev/core';
import {
  getSpatialColumns,
  addSpatialNullFilters,
  SpatialFormData,
} from '../spatialUtils';
import {
  addJsColumnsToColumns,
  addTooltipColumnsToQuery,
} from '../buildQueryUtils';
import { isMetricValue } from '../utils/metricUtils';

export interface DeckScatterFormData
  extends Omit<SpatialFormData, 'color_picker'>, SqlaFormData {
  // Can be a string (legacy format) or an object with type and value
  point_radius_fixed?:
    | string // Legacy format: metric name directly
    | {
        type?: 'fix' | 'metric';
        value?: QueryFormMetric | number;
      };
  multiplier?: number;
  point_unit?: string;
  min_radius?: number;
  max_radius?: number;
  color_picker?: { r: number; g: number; b: number; a: number };
  dimension?: string;
}

export default function buildQuery(formData: DeckScatterFormData) {
  const {
    spatial,
    point_radius_fixed,
    dimension,
    js_columns,
    tooltip_contents,
  } = formData;

  if (!spatial) {
    throw new Error('Spatial configuration is required for Scatter charts');
  }

  return buildQueryContext(formData, {
    buildQuery: (baseQueryObject: QueryObject) => {
      const spatialColumns = getSpatialColumns(spatial);
      let columns = [...(baseQueryObject.columns || []), ...spatialColumns];

      if (dimension) {
        columns.push(dimension);
      }

      const columnStrings = columns.map(col =>
        typeof col === 'string' ? col : col.label || col.sqlExpression || '',
      );
      const withJsColumns = addJsColumnsToColumns(columnStrings, js_columns);

      columns = withJsColumns as QueryFormColumn[];
      columns = addTooltipColumnsToQuery(columns, tooltip_contents);

      // Only add metric if point_radius_fixed is a metric type
      const isMetric = isMetricValue(point_radius_fixed);
      // Extract metric value: legacy string format or object with metric value
      const rawValue =
        typeof point_radius_fixed === 'string'
          ? point_radius_fixed
          : point_radius_fixed?.value;
      const metricValue: QueryFormMetric | null =
        isMetric && rawValue !== undefined && typeof rawValue !== 'number'
          ? (rawValue as QueryFormMetric)
          : null;

      // Preserve existing metrics and only add radius metric if it's metric-based
      const existingMetrics = baseQueryObject.metrics || [];
      // Deduplicate metrics using getMetricLabel for comparison
      const existingLabels = new Set(
        existingMetrics.map(m => getMetricLabel(m)),
      );
      const metrics: QueryFormMetric[] =
        metricValue && !existingLabels.has(getMetricLabel(metricValue))
          ? [...existingMetrics, metricValue]
          : existingMetrics;

      const filters = addSpatialNullFilters(
        spatial,
        ensureIsArray(baseQueryObject.filters || []),
      );

      // orderby needs string label, not the full metric object
      const orderby =
        isMetric && metricValue
          ? ([[getMetricLabel(metricValue), false]] as QueryFormOrderBy[])
          : (baseQueryObject.orderby as QueryFormOrderBy[]) || [];

      return [
        {
          ...baseQueryObject,
          columns,
          metrics,
          filters,
          orderby,
          is_timeseries: false,
          row_limit: baseQueryObject.row_limit,
        },
      ];
    },
  });
}
