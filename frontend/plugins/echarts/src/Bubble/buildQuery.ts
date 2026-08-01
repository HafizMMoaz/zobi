import {
  buildQueryContext,
  ensureIsArray,
  QueryFormData,
} from '@zobi.dev/core';

export default function buildQuery(formData: QueryFormData) {
  const columns = [
    ...ensureIsArray(formData.entity),
    ...ensureIsArray(formData.series),
  ];

  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns,
      orderby: baseQueryObject.orderby
        ? [[baseQueryObject.orderby[0], !baseQueryObject.order_desc]]
        : undefined,
    },
  ]);
}
