import { buildQueryContext, QueryFormData } from '@zobi-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { metric, sort_by_metric } = formData;
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      ...(sort_by_metric && { orderby: [[metric, false]] }),
    },
  ]);
}
