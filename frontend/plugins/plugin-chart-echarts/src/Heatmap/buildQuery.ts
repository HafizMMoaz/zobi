import {
  QueryFormColumn,
  QueryFormData,
  QueryFormOrderBy,
  buildQueryContext,
  ensureIsArray,
  getColumnLabel,
  getMetricLabel,
  getXAxisColumn,
} from '@zobi-ui/core';
import { rankOperator } from '@zobi-ui/chart-controls';

export default function buildQuery(formData: QueryFormData) {
  const { groupby, normalize_across, sort_x_axis, sort_y_axis, x_axis } =
    formData;
  const metric = getMetricLabel(formData.metric);
  const columns = [
    ...ensureIsArray(getXAxisColumn(formData)),
    ...ensureIsArray(groupby),
  ];
  const orderby: QueryFormOrderBy[] = [];
  if (sort_x_axis) {
    orderby.push([
      sort_x_axis.includes('value') ? metric : columns[0],
      sort_x_axis.includes('asc'),
    ]);
  }
  if (sort_y_axis) {
    orderby.push([
      sort_y_axis.includes('value') ? metric : columns[1],
      sort_y_axis.includes('asc'),
    ]);
  }
  const group_by =
    normalize_across === 'x'
      ? getColumnLabel(x_axis)
      : normalize_across === 'y'
        ? getColumnLabel(groupby as unknown as QueryFormColumn)
        : undefined;
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns,
      orderby,
      post_processing: [
        rankOperator(formData, baseQueryObject, {
          metric,
          group_by,
        }),
      ],
    },
  ]);
}
