import {
  QueryFormData,
  QueryFormMetric,
  QueryMode,
  TimeGranularity,
  TimeseriesDataRecord,
} from '@zobi-ui/core';

export interface HandlebarsStylesProps {
  height: number;
  width: number;
}

interface HandlebarsCustomizeProps {
  handlebarsTemplate?: string;
  styleTemplate?: string;
}

export type HandlebarsQueryFormData = QueryFormData &
  HandlebarsStylesProps &
  HandlebarsCustomizeProps & {
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
    table_timestamp_format?: string;
    granularitySqla?: string;
    time_grain_sqla?: TimeGranularity;
  };

export type HandlebarsProps = HandlebarsStylesProps &
  HandlebarsCustomizeProps & {
    data: TimeseriesDataRecord[];
    // add typing here for the props you pass in from transformProps.ts!
    formData: HandlebarsQueryFormData;
  };
