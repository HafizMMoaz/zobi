
import {
  getMetricLabel,
  ensureIsArray,
  PostProcessingAggregation,
  QueryFormData,
  Aggregates,
} from '@zobi-ui/core';
import { PostProcessingFactory } from './types';

export const aggregationOperator: PostProcessingFactory<
  PostProcessingAggregation
> = (formData: QueryFormData, queryObject) => {
  const { aggregation = 'LAST_VALUE' } = formData;

  if (aggregation === 'LAST_VALUE' || aggregation === 'raw') {
    return undefined;
  }

  const metrics = ensureIsArray(queryObject.metrics);
  if (metrics.length === 0) {
    return undefined;
  }

  const aggregates: Aggregates = {};
  metrics.forEach(metric => {
    const metricLabel = getMetricLabel(metric);
    aggregates[metricLabel] = {
      operator: aggregation,
      column: metricLabel,
    };
  });

  return {
    operation: 'aggregate',
    options: {
      groupby: [],
      aggregates,
    },
  };
};
