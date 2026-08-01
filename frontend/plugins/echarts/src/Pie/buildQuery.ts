import {
  buildQueryContext,
  getMetricLabel,
  QueryFormData,
} from '@zobi.dev/core';
import { getContributionLabel } from './utils';

export default function buildQuery(formData: QueryFormData) {
  const { metric, sort_by_metric } = formData;
  const metricLabel = getMetricLabel(metric);

  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      ...(sort_by_metric && { orderby: [[metric, false]] }),
      post_processing: [
        {
          operation: 'contribution',
          options: {
            columns: [metricLabel],
            rename_columns: [getContributionLabel(metricLabel)],
          },
        },
      ],
    },
  ]);
}
