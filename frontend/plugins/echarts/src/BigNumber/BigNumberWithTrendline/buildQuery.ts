import {
  buildQueryContext,
  ensureIsArray,
  getXAxisColumn,
  isXAxisSet,
  QueryFormData,
} from '@zobi.dev/core';
import {
  aggregationOperator,
  flattenOperator,
  pivotOperator,
  resampleOperator,
  rollingWindowOperator,
} from '@zobi.dev/chart-controls';

export default function buildQuery(formData: QueryFormData) {
  const isRawMetric = formData.aggregation === 'raw';

  const timeColumn = isXAxisSet(formData)
    ? ensureIsArray(getXAxisColumn(formData))
    : [];

  return buildQueryContext(formData, baseQueryObject => {
    const queries = [
      {
        ...baseQueryObject,
        columns: [...timeColumn],
        ...(timeColumn.length ? {} : { is_timeseries: true }),
        post_processing: [
          pivotOperator(formData, baseQueryObject),
          resampleOperator(formData, baseQueryObject),
          rollingWindowOperator(formData, baseQueryObject),
          flattenOperator(formData, baseQueryObject),
        ].filter(Boolean),
      },
    ];

    // Only add second query for raw metrics which need different query structure
    // All other aggregations (sum, mean, min, max, median, LAST_VALUE) can be computed client-side from trendline data
    if (formData.aggregation === 'raw') {
      queries.push({
        ...baseQueryObject,
        columns: [...(isRawMetric ? [] : timeColumn)],
        is_timeseries: !isRawMetric,
        post_processing: isRawMetric
          ? []
          : ([
              pivotOperator(formData, baseQueryObject),
              aggregationOperator(formData, baseQueryObject),
            ].filter(Boolean) as any[]),
      });
    }

    return queries;
  });
}
