import {
  ChartDataResponseResult,
  ChartProps,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@zobi-ui/core';
import {
  BaseTransformedProps,
  CrossFilterTransformedProps,
  LegendFormData,
} from '../types';

export type EchartsGanttChartTransformedProps =
  BaseTransformedProps<EchartsGanttFormData> & CrossFilterTransformedProps;

export type EchartsGanttFormData = QueryFormData &
  LegendFormData & {
    viz_type: 'gantt_chart';
    startTime: QueryFormColumn;
    endTime: QueryFormColumn;
    yAxis: QueryFormColumn;
    tooltipMetrics: QueryFormMetric[];
    tooltipColumns: QueryFormColumn[];
    series?: QueryFormColumn;
    xAxisTimeFormat?: string;
    tooltipTimeFormat?: string;
    tooltipValuesFormat?: string;
    colorScheme?: string;
    zoomable?: boolean;
    xAxisTitle?: string;
    xAxisTitleMargin?: number;
    yAxisTitle?: string;
    yAxisTitleMargin?: number;
    yAxisTitlePosition?: string;
    xAxisTimeBounds?: [string | null, string | null];
    subcategories?: boolean;
    showExtraControls?: boolean;
  };

export interface EchartsGanttChartProps extends ChartProps<EchartsGanttFormData> {
  formData: EchartsGanttFormData;
  queriesData: ChartDataResponseResult[];
}

export interface Cartesian2dCoordSys {
  type: 'cartesian2d';
  x: number;
  y: number;
  width: number;
  height: number;
}
