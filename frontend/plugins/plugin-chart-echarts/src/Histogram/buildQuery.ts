import { buildQueryContext } from '@zobi-ui/core';
import { histogramOperator } from '@zobi-ui/chart-controls';
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
