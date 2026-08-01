import {
  buildQueryContext,
  getColumnLabel,
  isPhysicalColumn,
  QueryObject,
  QueryObjectFilterClause,
  BuildQuery,
} from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { DEFAULT_FORM_DATA, PluginFilterSelectQueryFormData } from './types';

const buildQuery: BuildQuery<PluginFilterSelectQueryFormData> = (
  formData: PluginFilterSelectQueryFormData,
  options,
) => {
  const { search, coltypeMap } = options?.ownState || {};
  const { sortAscending, sortMetric } = { ...DEFAULT_FORM_DATA, ...formData };
  return buildQueryContext(formData, baseQueryObject => {
    const { columns = [], filters = [] } = baseQueryObject;
    const extraFilters: QueryObjectFilterClause[] = [];
    if (search) {
      columns.filter(isPhysicalColumn).forEach(column => {
        const label = getColumnLabel(column);
        if (
          coltypeMap[label] === GenericDataType.String ||
          (coltypeMap[label] === GenericDataType.Numeric &&
            !Number.isNaN(Number(search)))
        ) {
          extraFilters.push({
            col: column,
            op: 'ILIKE',
            val: `%${search}%`,
          });
        }
      });
    }

    const sortColumns = sortMetric ? [sortMetric] : columns;
    const query: QueryObject[] = [
      {
        ...baseQueryObject,
        columns,
        metrics: sortMetric ? [sortMetric] : [],
        filters: filters.concat(extraFilters),
        orderby:
          sortMetric || sortAscending !== undefined
            ? sortColumns.map(column => [column, !!sortAscending])
            : [],
      },
    ];
    return query;
  });
};

export default buildQuery;
