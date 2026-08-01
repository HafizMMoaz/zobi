import {
  buildQueryContext,
  ensureIsArray,
  SqlaFormData,
} from '@zobi.dev/core';
import {
  getSpatialColumns,
  addSpatialNullFilters,
  SpatialFormData,
} from '../spatialUtils';
import { addTooltipColumnsToQuery } from '../buildQueryUtils';

export interface DeckArcFormData extends SqlaFormData {
  start_spatial: SpatialFormData['spatial'];
  end_spatial: SpatialFormData['spatial'];
  dimension?: string;
  js_columns?: string[];
  tooltip_contents?: unknown[];
  tooltip_template?: string;
}

export default function buildQuery(formData: DeckArcFormData) {
  const {
    start_spatial,
    end_spatial,
    dimension,
    js_columns,
    tooltip_contents,
  } = formData;

  if (!start_spatial || !end_spatial) {
    throw new Error(
      'Start and end spatial configurations are required for Arc charts',
    );
  }

  return buildQueryContext(formData, baseQueryObject => {
    const startSpatialColumns = getSpatialColumns(start_spatial);
    const endSpatialColumns = getSpatialColumns(end_spatial);

    let columns = [
      ...(baseQueryObject.columns || []),
      ...startSpatialColumns,
      ...endSpatialColumns,
    ];

    if (dimension) {
      columns = [...columns, dimension];
    }

    const jsColumns = ensureIsArray(js_columns || []);
    jsColumns.forEach(col => {
      if (!columns.includes(col)) {
        columns.push(col);
      }
    });

    columns = addTooltipColumnsToQuery(columns, tooltip_contents);

    let filters = addSpatialNullFilters(
      start_spatial,
      ensureIsArray(baseQueryObject.filters || []),
    );
    filters = addSpatialNullFilters(end_spatial, filters);

    const isTimeseries = !!formData.time_grain_sqla;

    return [
      {
        ...baseQueryObject,
        columns,
        filters,
        is_timeseries: isTimeseries,
        row_limit: baseQueryObject.row_limit,
      },
    ];
  });
}
