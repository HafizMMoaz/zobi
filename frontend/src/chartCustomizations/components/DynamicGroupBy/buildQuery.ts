import { buildQueryContext, QueryFormData } from '@zobi-ui/core';

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
