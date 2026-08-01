import {
  buildQueryContext,
  normalizeOrderBy,
  QueryFormData,
} from '@zobi-ui/core';

export default function buildQuery(formData: QueryFormData) {
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      orderby: normalizeOrderBy(baseQueryObject).orderby,
    },
  ]);
}
