import { QueryFormColumn, QueryFormData } from '@zobi-ui/core';
import {
  BaseChartProps,
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
} from '../types';
import { DEFAULT_LEGEND_FORM_DATA } from '../constants';

export type AxisTickLineStyle = {
  width: number;
  color: string;
};

export type EchartsGaugeFormData = QueryFormData & {
  colorScheme?: string;
  groupby: QueryFormColumn[];
  metric?: string;
  rowLimit: number;
  minVal: number | null;
  maxVal: number | null;
  fontSize: number;
  numberFormat: string;
  animation: boolean;
  showProgress: boolean;
  overlap: boolean;
  roundCap: boolean;
  showAxisTick: boolean;
  showSplitLine: boolean;
  splitNumber: number;
  startAngle: number;
  endAngle: number;
  showPointer: boolean;
  intervals: string;
  intervalColorIndices: string;
  valueFormatter: string;
};

export const DEFAULT_FORM_DATA: Partial<EchartsGaugeFormData> = {
  ...DEFAULT_LEGEND_FORM_DATA,
  groupby: [],
  rowLimit: 10,
  minVal: null,
  maxVal: null,
  fontSize: 15,
  numberFormat: 'SMART_NUMBER',
  animation: true,
  showProgress: true,
  overlap: true,
  roundCap: false,
  showAxisTick: false,
  showSplitLine: false,
  splitNumber: 10,
  startAngle: 225,
  endAngle: -45,
  showPointer: true,
  intervals: '',
  intervalColorIndices: '',
  valueFormatter: '{value}',
};

export interface EchartsGaugeChartProps extends BaseChartProps<EchartsGaugeFormData> {
  formData: EchartsGaugeFormData;
}

export type GaugeChartTransformedProps =
  BaseTransformedProps<EchartsGaugeFormData> &
    ContextMenuTransformedProps &
    CrossFilterTransformedProps;
