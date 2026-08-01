import { GenericDataType } from '@zobi.dev/extension-api/common';
import { TimeseriesDataRecord } from '../../chart';
import { AnnotationData } from './AnnotationLayer';

/**
 * Primitive types for data field values.
 */
export type DataRecordValue = number | string | boolean | Date | null | bigint;

export interface DataRecord {
  [key: string]: DataRecordValue;
}

/**
 * Queried data for charts. The `queries` field from `POST /chart/data`.
 * See zobi/charts/schemas.py for the class of the same name.
 */
export interface ChartDataResponseResult {
  /**
   * Data for the annotation layer.
   */
  annotation_data: AnnotationData | null;
  cache_key: string | null;
  cache_timeout: number | null;
  cached_dttm: string | null;
  /**
   * UTC timestamp when the query was executed (ISO 8601 format).
   * For cached queries, this is when the original query ran.
   */
  queried_dttm: string | null;
  /**
   * Array of data records as dictionary
   */
  data: DataRecord[];
  /**
   * Name of each column, for retaining the order of the output columns.
   */
  colnames: string[];
  /**
   * Generic data types, based on the final output pandas dataframe.
   */
  coltypes: GenericDataType[];
  error: string | null;
  is_cached: boolean;
  query: string;
  rowcount: number;
  sql_rowcount: number;
  stacktrace: string | null;
  status:
    | 'stopped'
    | 'failed'
    | 'pending'
    | 'running'
    | 'scheduled'
    | 'success'
    | 'timed_out';
  from_dttm: number | null;
  to_dttm: number | null;
  // TODO(hainenber): define proper type for below attributes
  rejected_filters?: any[];
  applied_filters?: any[];
  /**
   * Detected ISO 4217 currency code when AUTO mode is used.
   * Returns the currency code if all filtered data contains a single currency,
   * or null if multiple currencies are present.
   */
  detected_currency?: string | null;
}

export interface TimeseriesChartDataResponseResult extends ChartDataResponseResult {
  data: TimeseriesDataRecord[];
  label_map: Record<string, string[]>;
}

/**
 * Query response from /api/v1/chart/data
 */
export interface ChartDataResponse {
  queries: ChartDataResponseResult[];
}

export default {};
