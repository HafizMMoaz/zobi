import {
  buildQueryContext,
  ensureIsArray,
  QueryFormData,
} from '@zobi.dev/core';

export default function buildQuery(formData: QueryFormData) {
  const { x_axis, granularity_sqla, groupby } = formData;
  const columns = [
    ...ensureIsArray(x_axis || granularity_sqla),
    ...ensureIsArray(groupby),
  ];
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns,
      orderby: columns?.map(column => [column, true]),
    },
  ]);
}
