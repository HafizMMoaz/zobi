import { buildQueryContext, QueryFormData } from '@zobi.dev/core';

export default function buildQuery(formData: QueryFormData) {
  return buildQueryContext(formData, () => [
    {
      result_type: 'columns',
      columns: [],
      metrics: [],
      orderby: [],
    },
  ]);
}
