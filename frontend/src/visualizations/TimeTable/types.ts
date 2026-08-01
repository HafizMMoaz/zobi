
export type SparkType = 'line' | 'bar' | 'area';

export interface ColumnConfig {
  key: string;
  label?: string;
  d3format?: string;
  colType?: string;
  comparisonType?: string;
  bounds?: [number | null, number | null] | null[];
  timeRatio?: string | number;
  timeLag?: number;
  tooltip?: string;
  width?: string;
  height?: string;
  dateFormat?: string;
  yAxisBounds?: [number | undefined, number | undefined] | null[];
  showYAxis?: boolean;
  sparkType?: SparkType;
}

export interface ColumnRow {
  label?: string;
  column_name?: string;
  [key: string]: any;
}

export interface MetricRow {
  label?: string;
  metric_name: string;
  verbose_name?: string;
  expression?: string;
  warning_text?: string;
  description?: string;
  d3format?: string;
  is_certified?: boolean;
  certified_by?: string;
  certification_details?: string;
  [key: string]: any;
}

export type Row = ColumnRow | MetricRow;

export interface TimeTableData {
  [timestamp: string]: {
    [metric: string]: number;
  };
}

export interface TimeTableProps {
  className?: string;
  height?: number;
  data: TimeTableData;
  columnConfigs: ColumnConfig[];
  rowType: 'column' | 'metric';
  rows: Row[];
  url?: string;
}

export interface Entry {
  time: string;
  [metric: string]: any;
}

export interface Stats {
  count: number;
  sum: number;
}
