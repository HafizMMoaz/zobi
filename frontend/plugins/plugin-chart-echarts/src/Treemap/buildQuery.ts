import {
  buildQueryContext,
  QueryFormData,
  QueryFormOrderBy,
} from '@zobi-ui/core';
import { buildColumnsOrderBy, applyOrderBy } from '../utils/orderby';

export default function buildQuery(formData: QueryFormData) {
  const { metric, sort_by_metric, groupby = [], row_limit } = formData;
  const orderby: QueryFormOrderBy[] = [];
  if (sort_by_metric && metric) {
    orderby.push([metric, false]);
  }
  orderby.push(...buildColumnsOrderBy(groupby));

  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      ...applyOrderBy(orderby, row_limit),
    },
  ]);
}
