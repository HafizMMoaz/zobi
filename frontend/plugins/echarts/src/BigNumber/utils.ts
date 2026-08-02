// Type augmentation for dayjs plugins
import 'dayjs/plugin/utc';
import {
  getTimeFormatter,
  getTimeFormatterForGranularity,
  isAdhocMetricSimple,
  isSavedMetric,
  Metric,
  QueryFormMetric,
  SMART_DATE_ID,
  TimeGranularity,
} from '@zobi.dev/core';
import { extendedDayjs as dayjs } from '@zobi.dev/core/utils/dates';

export const parseMetricValue = (metricValue: number | string | null) => {
  if (typeof metricValue === 'string') {
    const dateObject = dayjs.utc(metricValue, undefined, true);
    if (dateObject.isValid()) {
      return dateObject.valueOf();
    }
    return null;
  }
  return metricValue;
};

export const getDateFormatter = (
  timeFormat: string,
  granularity?: TimeGranularity,
  fallbackFormat?: string | null,
) =>
  timeFormat === SMART_DATE_ID
    ? getTimeFormatterForGranularity(granularity)
    : getTimeFormatter(timeFormat ?? fallbackFormat);

export function getOriginalLabel(
  metric: QueryFormMetric,
  metrics: Metric[] = [],
): string {
  const metricLabel = typeof metric === 'string' ? metric : metric.label || '';

  if (isSavedMetric(metric)) {
    const metricEntry = metrics.find(m => m.metric_name === metric);
    return (
      metricEntry?.verbose_name ||
      metricEntry?.metric_name ||
      metric ||
      'Unknown Metric'
    );
  }

  if (isAdhocMetricSimple(metric)) {
    const column = metric.column || {};
    const columnName = column.column_name || 'unknown_column';
    const verboseName = column.verbose_name || columnName;
    const aggregate = metric.aggregate || 'UNKNOWN';
    return metric.hasCustomLabel && metric.label
      ? metric.label
      : `${aggregate}(${verboseName})`;
  }

  if (
    typeof metric === 'object' &&
    'expressionType' in metric &&
    metric.expressionType === 'SQL' &&
    'sqlExpression' in metric
  ) {
    return metric.hasCustomLabel && metric.label
      ? metric.label
      : metricLabel || 'Custom Metric';
  }

  return metricLabel || 'Unknown Metric';
}
