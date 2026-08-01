import {
  buildQueryContext,
  ensureIsArray,
  QueryFormColumn,
  QueryObject,
  QueryObjectFilterClause,
  SqlaFormData,
} from '@zobi-ui/core';
import {
  addJsColumnsToColumns,
  addTooltipColumnsToQuery,
} from '../buildQueryUtils';

export interface DeckGeoJsonFormData extends SqlaFormData {
  geojson?: string;
  filter_nulls?: boolean;
  js_columns?: string[];
  cross_filter_column?: string | null;
  tooltip_contents?: unknown[];
}

export default function buildQuery(formData: DeckGeoJsonFormData) {
  const {
    geojson,
    filter_nulls = true,
    js_columns,
    cross_filter_column,
    tooltip_contents,
  } = formData;

  if (!geojson) {
    throw new Error('GeoJSON column is required for GeoJSON charts');
  }

  return buildQueryContext(formData, (baseQueryObject: QueryObject) => {
    let columns: QueryFormColumn[] = [
      ...ensureIsArray(baseQueryObject.columns || []),
      geojson,
    ];

    // Add js_columns
    const columnStrings = columns.map(col =>
      typeof col === 'string' ? col : col.label || col.sqlExpression || '',
    );
    const withJsColumns = addJsColumnsToColumns(columnStrings, js_columns);
    columns = withJsColumns as QueryFormColumn[];

    if (cross_filter_column && !columns.includes(cross_filter_column)) {
      columns.push(cross_filter_column);
    }

    // Add tooltip columns
    columns = addTooltipColumnsToQuery(columns, tooltip_contents);

    // Add null filter for geojson column
    const filters: QueryObjectFilterClause[] = ensureIsArray(
      baseQueryObject.filters || [],
    );
    if (filter_nulls) {
      filters.push({ col: geojson, op: 'IS NOT NULL' });
    }

    return [
      {
        ...baseQueryObject,
        columns,
        metrics: [],
        groupby: [],
        filters,
        is_timeseries: false,
      },
    ];
  });
}
