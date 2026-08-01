import { t } from '@zobi/core/translation';
import { DTTM_ALIAS, QueryColumn, QueryMode } from '@zobi-ui/core';
import { GenericDataType } from '@zobi/core/common';
import { ColumnMeta, SortSeriesData, SortSeriesType } from './types';

export const DEFAULT_MAX_ROW = 100000;
export const DEFAULT_MAX_ROW_TABLE_SERVER = 500000;

// eslint-disable-next-line import/prefer-default-export
export const TIME_FILTER_LABELS = {
  time_range: t('Time Range'),
  granularity_sqla: t('Time Column'),
  time_grain_sqla: t('Time Grain'),
  granularity: t('Time Granularity'),
};

export const COLUMN_NAME_ALIASES: Record<string, string> = {
  [DTTM_ALIAS]: t('Time'),
};

export const DATASET_TIME_COLUMN_OPTION: ColumnMeta = {
  verbose_name: COLUMN_NAME_ALIASES[DTTM_ALIAS],
  column_name: DTTM_ALIAS,
  type: 'TIMESTAMP',
  type_generic: GenericDataType.Temporal,
  description: t(
    'A reference to the [Time] configuration, taking granularity into account',
  ),
};

export const QUERY_TIME_COLUMN_OPTION: QueryColumn = {
  column_name: DTTM_ALIAS,
  is_dttm: true,
  type: 'TIMESTAMP',
  type_generic: GenericDataType.Temporal,
};

export const QueryModeLabel = {
  [QueryMode.Aggregate]: t('Aggregate'),
  [QueryMode.Raw]: t('Raw records'),
};

export const DEFAULT_SORT_SERIES_DATA: SortSeriesData = {
  sort_series_type: SortSeriesType.Sum,
  sort_series_ascending: false,
};

export const SORT_SERIES_CHOICES = [
  [SortSeriesType.Name, t('Category name')],
  [SortSeriesType.Sum, t('Total value')],
  [SortSeriesType.Min, t('Minimum value')],
  [SortSeriesType.Max, t('Maximum value')],
  [SortSeriesType.Avg, t('Average value')],
];

export const DEFAULT_XAXIS_SORT_SERIES_DATA: SortSeriesData = {
  sort_series_type: SortSeriesType.Name,
  sort_series_ascending: true,
};

export const DEFAULT_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/g;

// When it fails to parse a date
export const INVALID_DATE = 'Invalid date';
