import {
  ChartDataResponseResult,
  ChartProps,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
  RgbaColor,
} from '@zobi-ui/core';
import type { BarDataItemOption } from 'echarts/types/src/chart/bar/BarSeries';
import type { CallbackDataParams } from 'echarts/types/src/util/types';
import { BaseTransformedProps, LegendFormData } from '../types';

export type WaterfallFormXTicksLayout =
  | '45°'
  | '90°'
  | 'auto'
  | 'flat'
  | 'staggered';

export type ISeriesData = {
  originalValue?: number;
  totalSum?: number;
} & BarDataItemOption;

export type ICallbackDataParams = CallbackDataParams & {
  axisValueLabel: string;
  data: ISeriesData;
};

export type EchartsWaterfallFormData = QueryFormData &
  LegendFormData & {
    increaseColor: RgbaColor;
    decreaseColor: RgbaColor;
    totalColor: RgbaColor;
    metric: QueryFormMetric;
    xAxis: QueryFormColumn;
    xAxisLabel: string;
    xAxisTimeFormat?: string;
    xTicksLayout?: WaterfallFormXTicksLayout;
    yAxisLabel: string;
    yAxisFormat: string;
    increaseLabel?: string;
    decreaseLabel?: string;
    totalLabel?: string;
    showTotal: boolean;
  };

export const DEFAULT_FORM_DATA: Partial<EchartsWaterfallFormData> = {
  showLegend: true,
};

export interface EchartsWaterfallChartProps extends ChartProps {
  formData: EchartsWaterfallFormData;
  queriesData: ChartDataResponseResult[];
}

export type WaterfallChartTransformedProps =
  BaseTransformedProps<EchartsWaterfallFormData>;
