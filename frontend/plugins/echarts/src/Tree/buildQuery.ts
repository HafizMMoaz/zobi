import { buildQueryContext } from '@zobi.dev/core';
import { EchartsTreeFormData } from './types';
import { buildColumnsOrderBy, applyOrderBy } from '../utils/orderby';

export default function buildQuery(formData: EchartsTreeFormData) {
  const { id, parent, name, row_limit } = formData;
  const orderby = buildColumnsOrderBy([parent, id, name]);

  return buildQueryContext(formData, {
    queryFields: {
      id: 'columns',
      parent: 'columns',
      name: 'columns',
    },
    buildQuery: baseQueryObject => [
      {
        ...baseQueryObject,
        ...applyOrderBy(orderby, row_limit),
      },
    ],
  });
}
