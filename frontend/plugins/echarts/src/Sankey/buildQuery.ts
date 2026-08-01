import { buildQueryContext, QueryFormOrderBy } from '@zobi.dev/core';
import { SankeyFormData } from './types';

export default function buildQuery(formData: SankeyFormData) {
  const { metric, sort_by_metric, source, target, row_limit } = formData;
  const groupby = [source, target];
  const orderby: QueryFormOrderBy[] = [];
  const shouldApplyOrderBy =
    row_limit !== undefined && row_limit !== null && row_limit !== 0;

  if (sort_by_metric && metric) {
    orderby.push([metric, false]);
  }
  [source, target].forEach(column => {
    if (column) {
      orderby.push([column, true]);
    }
  });

  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      groupby,
      ...(shouldApplyOrderBy && orderby.length > 0 && { orderby }),
    },
  ]);
}
