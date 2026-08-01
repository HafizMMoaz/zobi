import {
  ensureIsArray,
  getMetricLabel,
  QueryFormData,
  QueryFormMetric,
} from '@zobi.dev/core';

export function extractExtraMetrics(
  formData: QueryFormData,
): QueryFormMetric[] {
  const { groupby, timeseries_limit_metric, x_axis_sort, metrics } = formData;
  const extra_metrics: QueryFormMetric[] = [];
  const limitMetric = ensureIsArray(timeseries_limit_metric)[0];
  if (
    !(groupby || []).length &&
    limitMetric &&
    getMetricLabel(limitMetric) === x_axis_sort &&
    !metrics?.some(metric => getMetricLabel(metric) === x_axis_sort)
  ) {
    extra_metrics.push(limitMetric);
  }
  return extra_metrics;
}
