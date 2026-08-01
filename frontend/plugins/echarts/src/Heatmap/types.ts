import {
  Currency,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
  RgbaColor,
} from '@zobi.dev/core';
import { BaseChartProps, BaseTransformedProps } from '../types';

export interface HeatmapFormData extends QueryFormData {
  bottomMargin: string;
  currencyFormat?: Currency;
  leftMargin: string;
  legendType: 'continuous' | 'piecewise';
  linearColorScheme?: string;
  metric: QueryFormMetric;
  normalizeAcross: 'heatmap' | 'x' | 'y';
  normalized?: boolean;
  borderColor: RgbaColor;
  borderWidth: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  showValues?: boolean;
  sortXAxis?: string;
  sortYAxis?: string;
  timeFormat?: string;
  xAxis: QueryFormColumn;
  xAxisLabelRotation: number;
  xscaleInterval: number;
  valueBounds: [number | undefined | null, number | undefined | null];
  yAxisFormat?: string;
  yscaleInterval: number;
}

export interface HeatmapChartProps extends BaseChartProps<HeatmapFormData> {
  formData: HeatmapFormData;
}

export type HeatmapTransformedProps = BaseTransformedProps<HeatmapFormData>;
