import {
  buildQueryContext,
  ensureIsArray,
  QueryFormColumn,
  QueryObject,
  QueryObjectFilterClause,
  SqlaFormData,
} from '@zobi.dev/core';

export interface MapLibreFormData extends SqlaFormData {
  all_columns_x?: string;
  all_columns_y?: string;
  map_label?: string[];
  point_radius?: string;
  clustering_radius?: string;
  pandas_aggfunc?: string;
  global_opacity?: number;
  maplibre_style?: string;
  mapbox_style?: string;
  map_color?: string;
  render_while_dragging?: boolean;
  point_radius_unit?: string;
}

export default function buildQuery(formData: MapLibreFormData) {
  const { all_columns_x, all_columns_y, map_label, point_radius } = formData;

  if (!all_columns_x || !all_columns_y) {
    throw new Error('Longitude and latitude columns are required');
  }

  return buildQueryContext(formData, (baseQueryObject: QueryObject) => {
    const columns: QueryFormColumn[] = [
      ...ensureIsArray(baseQueryObject.columns || []),
      all_columns_x,
      all_columns_y,
    ];

    // Add label column if specified and not 'count'
    const hasCustomMetric =
      map_label && map_label.length > 0 && map_label[0] !== 'count';
    if (hasCustomMetric) {
      columns.push(map_label[0]);
    }

    // Add point radius column if not "Auto"
    if (point_radius && point_radius !== 'Auto') {
      columns.push(point_radius);
    }

    // Add null filters for lon/lat
    const filters: QueryObjectFilterClause[] = ensureIsArray(
      baseQueryObject.filters || [],
    );
    filters.push(
      { col: all_columns_x, op: 'IS NOT NULL' },
      { col: all_columns_y, op: 'IS NOT NULL' },
    );

    // Deduplicate columns
    const uniqueColumns = [...new Set(columns)];

    return [
      {
        ...baseQueryObject,
        columns: uniqueColumns,
        filters,
        is_timeseries: false,
      },
    ];
  });
}
