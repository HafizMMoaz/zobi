import {
  buildQueryContext,
  QueryFormData,
  ensureIsArray,
} from '@zobi-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { series_limit_metric } = formData;
  const sortByMetric = ensureIsArray(series_limit_metric)[0];

  return buildQueryContext(formData, baseQueryObject => {
    let { metrics, orderby = [] } = baseQueryObject;
    metrics = metrics || [];
    // override orderby with timeseries metric
    if (sortByMetric) {
      orderby = [[sortByMetric, false]];
    } else if (metrics?.length > 0) {
      // default to ordering by first metric in descending order
      // when no "sort by" metric is set (regardless if "SORT DESC" is set to true)
      orderby = [[metrics[0], false]];
    }
    return [
      {
        ...baseQueryObject,
        orderby,
      },
    ];
  });
}
