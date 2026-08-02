import type { EChartsCoreOption } from 'echarts/core';
import {
  ChartDataResponseResult,
  ContextMenuFilters,
  DataRecordValue,
  QueryFormData,
  QueryFormMetric,
  TimeFormatter,
  ValueFormatter,
} from '@zobi.dev/core';
import { ColorFormatters } from '@zobi.dev/chart-controls';
import { BaseChartProps, Refs } from '../types';

export interface BigNumberDatum {
  [key: string]: number | string | null;
}

export type BigNumberTotalFormData = QueryFormData & {
  metric?: QueryFormMetric;
  yAxisFormat?: string;
  forceTimestampFormatting?: boolean;
};

export type BigNumberWithTrendlineFormData = BigNumberTotalFormData & {
  colorPicker: {
    r: number;
    g: number;
    b: number;
  };
  compareLag?: string | number;
  xAxis: string;
  showXAxis?: boolean;
  showXAxisMinMaxLabels?: boolean;
  showYAxis?: boolean;
  showYAxisMinMaxLabels?: boolean;
};

export interface BigNumberTotalChartDataResponseResult extends ChartDataResponseResult {
  data: BigNumberDatum[];
}

export type BigNumberTotalChartProps =
  BaseChartProps<BigNumberTotalFormData> & {
    formData: BigNumberTotalFormData;
    queriesData: BigNumberTotalChartDataResponseResult[];
  };

export type BigNumberWithTrendlineChartProps =
  BaseChartProps<BigNumberWithTrendlineFormData> & {
    formData: BigNumberWithTrendlineFormData;
  };

export type TimeSeriesDatum = [number, number | null];

export type BigNumberVizProps = {
  className?: string;
  width: number;
  height: number;
  bigNumber?: DataRecordValue;
  bigNumberFallback?: TimeSeriesDatum;
  headerFormatter: ValueFormatter | TimeFormatter;
  formatTime?: TimeFormatter;
  metricName?: string;
  friendlyMetricName?: string;
  metricNameFontSize?: number;
  showMetricName?: boolean;
  headerFontSize: number;
  kickerFontSize?: number;
  subheader?: string;
  subtitle: string;
  subheaderFontSize: number;
  subtitleFontSize: number;
  showTimestamp?: boolean;
  showTrendLine?: boolean;
  startYAxisAtZero?: boolean;
  timeRangeFixed?: boolean;
  timestamp?: DataRecordValue;
  trendLineData?: TimeSeriesDatum[];
  mainColor?: string;
  echartOptions?: EChartsCoreOption;
  isRefreshing?: boolean;
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;
  xValueFormatter?: TimeFormatter;
  formData?: BigNumberWithTrendlineFormData;
  refs: Refs;
  colorThresholdFormatters?: ColorFormatters;
};
