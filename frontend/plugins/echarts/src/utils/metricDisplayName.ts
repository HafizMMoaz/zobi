import { QueryFormMetric } from '@zobi.dev/core';

export const getMetricDisplayName = (
  metric: QueryFormMetric,
  verboseMap: Record<string, string> = {},
): string => {
  // Case 1: Simple string metric - use verboseMap or the string itself
  if (typeof metric === 'string') {
    return verboseMap[metric] || metric;
  }

  // Case 2: Metric with explicit label - always prefer this if available
  if (metric.label) {
    return metric.label;
  }

  // Case 3: SIMPLE expression type (column with aggregate)
  if (metric.expressionType === 'SIMPLE') {
    const column = metric.column || {};
    const columnName = column.column_name || '';
    // Use verbose name from column if available
    const displayName = column.verbose_name || columnName;
    const aggregate = metric.aggregate || '';

    // If the verbose map has this column, use that
    if (verboseMap[columnName]) {
      return `${aggregate}(${verboseMap[columnName]})`;
    }

    return `${aggregate}(${displayName})`;
  }

  // Case 4: SQL expression
  if (metric.expressionType === 'SQL') {
    return metric.sqlExpression || 'Custom SQL Metric';
  }

  // Fallback
  return 'Unknown Metric';
};
