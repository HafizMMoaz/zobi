import { QueryFormColumn, QueryFormData } from '@zobi.dev/core';
import { BaseChartProps, BaseTransformedProps } from '../types';

export type HistogramFormData = QueryFormData & {
  bins: number;
  column: QueryFormColumn;
  colorScheme?: string;
  cumulative: boolean;
  normalize: boolean;
  sliceId: number;
  showLegend: boolean;
  showValue: boolean;
  xAxisFormat: string;
  xAxisTitle: string;
  yAxisFormat: string;
  yAxisTitle: string;
};

export interface HistogramChartProps extends BaseChartProps<HistogramFormData> {
  formData: HistogramFormData;
}

export type HistogramTransformedProps =
  BaseTransformedProps<HistogramFormData> & {
    onFocusedSeries: (index: number | undefined) => void;
  };
