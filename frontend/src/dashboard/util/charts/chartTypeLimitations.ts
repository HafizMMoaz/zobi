export interface ChartTypeLimitation {
  maxDimensions: number;
  dimensionNames: string[];
  warningMessage: (usedColumns: string[], ignoredColumns: string[]) => string;
}

export const CHART_TYPE_LIMITATIONS: Record<string, ChartTypeLimitation> = {
  heatmap: {
    maxDimensions: 1,
    dimensionNames: ['column'],
    warningMessage: (usedColumns, ignoredColumns) =>
      `Heatmap charts only support one column dimension. Using "${usedColumns[0]}" only. Additional columns (${ignoredColumns.join(', ')}) will be ignored.`,
  },
  heatmap_v2: {
    maxDimensions: 1,
    dimensionNames: ['column'],
    warningMessage: (usedColumns, ignoredColumns) =>
      `Heatmap charts only support one column dimension. Using "${usedColumns[0]}" only. Additional columns (${ignoredColumns.join(', ')}) will be ignored.`,
  },
  waterfall: {
    maxDimensions: 1,
    dimensionNames: ['dimension'],
    warningMessage: (usedColumns, ignoredColumns) =>
      `Waterfall charts only support one dimension. Using "${usedColumns[0]}" only. Additional columns (${ignoredColumns.join(', ')}) will be ignored.`,
  },
  word_cloud: {
    maxDimensions: 1,
    dimensionNames: ['series'],
    warningMessage: (usedColumns, ignoredColumns) =>
      `Word cloud charts only support one series dimension. Using "${usedColumns[0]}" only. Additional columns (${ignoredColumns.join(', ')}) will be ignored.`,
  },

  graph_chart: {
    maxDimensions: 2,
    dimensionNames: ['source', 'target'],
    warningMessage: (usedColumns, ignoredColumns) =>
      `Graph charts only support two dimensions (source and target). Using "${usedColumns[0]}" for source and "${usedColumns[1]}" for target. Additional columns (${ignoredColumns.join(', ')}) will be ignored.`,
  },
  sankey_v2: {
    maxDimensions: 2,
    dimensionNames: ['source', 'target'],
    warningMessage: (usedColumns, ignoredColumns) =>
      `Sankey charts only support two dimensions (source and target). Using "${usedColumns[0]}" for source and "${usedColumns[1]}" for target. Additional columns (${ignoredColumns.join(', ')}) will be ignored.`,
  },
  bubble_v2: {
    maxDimensions: 2,
    dimensionNames: ['series', 'entity'],
    warningMessage: (usedColumns, ignoredColumns) =>
      `Bubble charts only support two dimensions (series and entity). Using "${usedColumns[0]}" for series and "${usedColumns[1]}" for entity. Additional columns (${ignoredColumns.join(', ')}) will be ignored.`,
  },
};

export const CHARTS_WITHOUT_GROUPBY = [
  'big_number',
  'big_number_total',
  'pop_kpi',
  'cal_heatmap',
  'country_map',
  'gantt',
  'world_map',
  'deck_arc',
  'deck_geojson',
  'deck_grid',
  'deck_hex',
  'deck_heatmap',
  'deck_multi',
  'deck_polygon',
  'deck_scatter',
  'deck_screengrid',
  'deck_contour',
  'deck_path',
];

export const SINGLE_COLUMN_DIMENSION_CHARTS = [
  'heatmap',
  'heatmap_v2',
  'waterfall',
];

export function getChartTypeLimitation(
  chartType: string,
): ChartTypeLimitation | null {
  return CHART_TYPE_LIMITATIONS[chartType] || null;
}

export function isSingleColumnDimensionChart(chartType: string): boolean {
  return SINGLE_COLUMN_DIMENSION_CHARTS.includes(chartType);
}

export function isChartWithoutGroupBy(chartType: string): boolean {
  return CHARTS_WITHOUT_GROUPBY.includes(chartType);
}

export function limitColumnsForChartType(
  chartType: string,
  columns: string[],
): { limitedColumns: string[]; ignoredColumns: string[]; warning?: string } {
  const limitation = getChartTypeLimitation(chartType);

  if (!limitation || columns.length <= limitation.maxDimensions) {
    return { limitedColumns: columns, ignoredColumns: [] };
  }

  const limitedColumns = columns.slice(0, limitation.maxDimensions);
  const ignoredColumns = columns.slice(limitation.maxDimensions);
  const warning = limitation.warningMessage(limitedColumns, ignoredColumns);

  return { limitedColumns, ignoredColumns, warning };
}
