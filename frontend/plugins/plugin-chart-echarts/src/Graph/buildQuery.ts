import { buildQueryContext } from '@zobi-ui/core';
import { EchartsGraphFormData } from './types';
import { buildColumnsOrderBy, applyOrderBy } from '../utils/orderby';

export default function buildQuery(formData: EchartsGraphFormData) {
  const { source, target, source_category, target_category, row_limit } =
    formData;
  const orderby = buildColumnsOrderBy([
    source,
    target,
    source_category,
    target_category,
  ]);

  return buildQueryContext(formData, {
    queryFields: {
      source: 'columns',
      target: 'columns',
      source_category: 'columns',
      target_category: 'columns',
    },
    buildQuery: baseQueryObject => [
      {
        ...baseQueryObject,
        ...applyOrderBy(orderby, row_limit),
      },
    ],
  });
}
