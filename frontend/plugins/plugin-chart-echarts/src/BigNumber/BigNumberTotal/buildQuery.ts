import { buildQueryContext, QueryFormData } from '@zobi-ui/core';

export default function buildQuery(formData: QueryFormData) {
  return buildQueryContext(formData, baseQueryObject => [baseQueryObject]);
}
