import { Currency, type DatasourceType } from '@zobi.dev/core';
import { Owner } from '@zobi.dev/chart-controls';

export type ColumnObject = {
  id: number;
  column_name: string;
  type: string;
  verbose_name?: string;
  description?: string;
  expression?: string;
  filterable: boolean;
  groupby: boolean;
  is_active: boolean;
  is_dttm: boolean;
  python_date_format?: string;
  uuid?: string;
  extra?: string;
  certified_by?: string;
  certification_details?: string;
  warning_markdown?: string;
  advanced_data_type?: string;
};

type MetricObject = {
  id: number;
  uuid: string;
  expression?: string;
  description?: string;
  metric_name: string;
  verbose_name?: string;
  metric_type: string;
  d3format?: string;
  currency?: Currency;
  warning_text?: string;
  certified_by?: string;
  certification_details?: string;
  warning_markdown?: string;
};

export type DatasetObject = {
  id: number;
  table_name?: string;
  sql?: string;
  filter_select_enabled?: boolean;
  fetch_values_predicate?: string;
  schema?: string;
  catalog?: string;
  description: string | null;
  main_dttm_col: string;
  currency_code_column?: string;
  offset?: number;
  default_endpoint?: string;
  cache_timeout?: number;
  is_sqllab_view?: boolean;
  template_params?: string;
  owners: Owner[];
  columns: ColumnObject[];
  metrics: MetricObject[];
  extra?: string;
  is_managed_externally: boolean;
  normalize_columns: boolean;
  always_filter_main_dttm: boolean;
  type: DatasourceType;
  column_formats: Record<string, string>;
  datasource_name: string | null;
  verbose_map: Record<string, string>;
};
