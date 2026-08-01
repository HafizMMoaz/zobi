import {
  ChartProps,
  ChartDataResponseResult,
  QueryFormData,
} from '@zobi.dev/core';
import {
  LegendFormData,
  BaseTransformedProps,
  CrossFilterTransformedProps,
} from '../types';

export type EchartsBubbleFormData = QueryFormData &
  LegendFormData & {
    series?: string;
    entity: string;
    xAxisFormat: string;
    yAXisFormat: string;
    logXAxis: boolean;
    logYAxis: boolean;
    xAxisBounds: [number | undefined | null, number | undefined | null];
    yAxisBounds: [number | undefined | null, number | undefined | null];
    xAxisLabel?: string;
    colorScheme?: string;
    defaultValue?: string[] | null;
    dateFormat: string;
    emitFilter: boolean;
    tooltipFormat: string;
    x: string;
    y: string;
  };

export interface EchartsBubbleChartProps extends ChartProps<EchartsBubbleFormData> {
  formData: EchartsBubbleFormData;
  queriesData: ChartDataResponseResult[];
}

export type BubbleChartTransformedProps =
  BaseTransformedProps<EchartsBubbleFormData> & CrossFilterTransformedProps;
