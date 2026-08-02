import { buildQueryContext, QueryFormOrderBy } from '@zobi.dev/core';
import { WordCloudFormData } from '../types';

export default function buildQuery(formData: WordCloudFormData) {
  const { metric, sort_by_metric, sort_by_series, series, row_limit } =
    formData;
  const orderby: QueryFormOrderBy[] = [];
  const shouldApplyOrderBy =
    row_limit !== undefined && row_limit !== null && row_limit !== 0;

  if (sort_by_metric && metric) {
    orderby.push([metric, false]);
  }
  if (sort_by_series !== false && series) {
    orderby.push([series, true]);
  }

  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      ...(shouldApplyOrderBy && orderby.length > 0 && { orderby }),
    },
  ]);
}
