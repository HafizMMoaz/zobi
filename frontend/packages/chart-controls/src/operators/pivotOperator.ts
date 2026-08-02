import {
  ensureIsArray,
  getColumnLabel,
  getMetricLabel,
  PostProcessingPivot,
  getXAxisLabel,
} from '@zobi.dev/core';
import { PostProcessingFactory } from './types';
import { extractExtraMetrics } from './utils';

export const pivotOperator: PostProcessingFactory<PostProcessingPivot> = (
  formData,
  queryObject,
) => {
  const metricLabels = [
    ...ensureIsArray(queryObject.metrics),
    ...extractExtraMetrics(formData),
  ].map(getMetricLabel);
  const xAxisLabel = getXAxisLabel(formData);
  const columns = queryObject.series_columns || queryObject.columns;

  if (xAxisLabel && metricLabels.length) {
    return {
      operation: 'pivot',
      options: {
        index: [xAxisLabel],
        columns: ensureIsArray(columns).map(getColumnLabel),
        // Create 'dummy' mean aggregates to assign cell values in pivot table
        // use the 'mean' aggregates to avoid drop NaN. PR: https://github.com/zobi/zobi-ui/pull/1231
        aggregates: Object.fromEntries(
          metricLabels.map(metric => [metric, { operator: 'mean' }]),
        ),
        drop_missing_columns: !formData?.show_empty_columns,
      },
    };
  }

  return undefined;
};
