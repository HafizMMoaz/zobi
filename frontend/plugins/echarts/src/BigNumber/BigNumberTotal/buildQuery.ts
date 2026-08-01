import { buildQueryContext, QueryFormData } from '@zobi.dev/core';

export default function buildQuery(formData: QueryFormData) {
  return buildQueryContext(formData, baseQueryObject => [baseQueryObject]);
}
