import { nanoid } from 'nanoid';
import { Column } from './Column';
import { Metric } from './Metric';

export enum DatasourceType {
  Table = 'table',
  Query = 'query',
  Dataset = 'dataset',
  SlTable = 'sl_table',
  SavedQuery = 'saved_query',
  SemanticView = 'semantic_view',
}

export interface Currency {
  symbol: string;
  symbolPosition: string;
}

/**
 * Datasource metadata.
 */
export interface Datasource {
  id: number;
  name: string;
  type: DatasourceType;
  /**
   * The parent resource that owns this datasource.
   * For SQL-based datasets this is the database; for semantic views it is the
   * semantic layer.  Use this field instead of the legacy `database` field when
   * you only need the display name.
   */
  parent?: { name: string };
  columns: Column[];
  metrics: Metric[];
  description?: string;
  // key is column names (labels)
  columnFormats?: {
    [key: string]: string;
  };
  currencyFormats?: {
    [key: string]: Currency;
  };
  verboseMap?: {
    [key: string]: string;
  };
  currencyCodeColumn?: string;
}

export const DEFAULT_METRICS: Metric[] = [
  {
    metric_name: 'COUNT(*)',
    expression: 'COUNT(*)',
    uuid: nanoid(),
  },
];

export default {};
