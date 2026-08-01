import {
  TimeGranularity,
  QueryFormMetric,
  ChartProps,
  DataRecord,
  DataRecordFilters,
  QueryMode,
  ChartDataResponseResult,
  QueryFormData,
  SetDataMaskHook,
  ContextMenuFilters,
} from '@zobi.dev/core';
import type {
  BasicColorFormatterType,
  ColorFormatters,
  DataColumnMeta,
  ServerPaginationData,
  TableColumnConfig,
} from '@zobi.dev/chart-controls';

// Re-export shared types used by internal plugin files that import from './types'
// Types used locally in this file - re-export from local binding
export type {
  BasicColorFormatterType,
  DataColumnMeta,
  ServerPaginationData,
  TableColumnConfig,
};
// Types only re-exported, not used locally - direct re-export
export type { SearchOption, SortByItem } from '@zobi.dev/chart-controls';

export interface TableChartData {
  records: DataRecord[];
  columns: string[];
}

export type TableChartFormData = QueryFormData & {
  align_pn?: boolean;
  color_pn?: boolean;
  include_time?: boolean;
  include_search?: boolean;
  query_mode?: QueryMode;
  page_length?: string | number | null; // null means auto-paginate
  metrics?: QueryFormMetric[] | null;
  percent_metrics?: QueryFormMetric[] | null;
  timeseries_limit_metric?: QueryFormMetric[] | QueryFormMetric | null;
  groupby?: QueryFormMetric[] | null;
  all_columns?: QueryFormMetric[] | null;
  order_desc?: boolean;
  show_cell_bars?: boolean;
  table_timestamp_format?: string;
  time_grain_sqla?: TimeGranularity;
  column_config?: Record<string, TableColumnConfig>;
  allow_rearrange_columns?: boolean;
};

export interface TableChartProps extends ChartProps {
  ownCurrentState?: {
    pageSize?: number;
    currentPage?: number;
  };
  rawFormData: TableChartFormData;
  queriesData: ChartDataResponseResult[];
}

export interface TableChartTransformedProps<D extends DataRecord = DataRecord> {
  timeGrain?: TimeGranularity;
  height: number;
  width: number;
  rowCount?: number;
  serverPagination: boolean;
  serverPaginationData: ServerPaginationData;
  setDataMask: SetDataMaskHook;
  isRawRecords?: boolean;
  data: D[];
  totals?: D;
  columns: DataColumnMeta[];
  metrics?: (keyof D)[];
  percentMetrics?: (keyof D)[];
  pageSize?: number;
  showCellBars?: boolean;
  sortDesc?: boolean;
  includeSearch?: boolean;
  alignPositiveNegative?: boolean;
  colorPositiveNegative?: boolean;
  tableTimestampFormat?: string;
  // These are dashboard filters, don't be confused with in-chart search filter
  // enabled by `includeSearch`
  filters?: DataRecordFilters;
  emitCrossFilters?: boolean;
  onChangeFilter?: ChartProps['hooks']['onAddFilter'];
  columnColorFormatters?: ColorFormatters;
  allowRearrangeColumns?: boolean;
  allowRenderHtml?: boolean;
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;
  isUsingTimeComparison?: boolean;
  basicColorFormatters?: { [Key: string]: BasicColorFormatterType }[];
  basicColorColumnFormatters?: { [Key: string]: BasicColorFormatterType }[];
  startDateOffset?: string;
  // For explore page to reset the server Pagination data
  // if server page length is changed from control panel
  hasServerPageLengthChanged: boolean;
  serverPageLength: number;
  slice_id: number;
  // Maps column labels (used as keys in query results) back to original
  // column names for cross-filtering, so that adhoc columns with custom labels
  // emit the correct column name in cross-filter data masks
  columnLabelToNameMap?: Record<string, string>;
}

export default {};
