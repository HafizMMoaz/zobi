import { buildQueryContext } from '@zobi.dev/core';
import { histogramOperator } from '@zobi.dev/chart-controls';
import { HistogramFormData } from './types';

export default function buildQuery(formData: HistogramFormData) {
  const { column, groupby = [] } = formData;
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns: [...groupby, column],
      post_processing: [histogramOperator(formData, baseQueryObject)],
      metrics: undefined,
    },
  ]);
}
