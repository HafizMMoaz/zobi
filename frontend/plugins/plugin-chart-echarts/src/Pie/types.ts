import { QueryFormColumn, QueryFormData } from '@zobi-ui/core';
import {
  BaseChartProps,
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
  LegendFormData,
  LegendOrientation,
  LegendType,
} from '../types';
import { DEFAULT_LEGEND_FORM_DATA } from '../constants';

export type EchartsPieFormData = QueryFormData &
  LegendFormData & {
    colorScheme?: string;
    currentOwnValue?: string[] | null;
    donut: boolean;
    defaultValue?: string[] | null;
    groupby: QueryFormColumn[];
    innerRadius: number;
    labelLine: boolean;
    labelType: EchartsPieLabelType;
    labelTemplate: string | null;
    labelsOutside: boolean;
    metric?: string;
    outerRadius: number;
    showLabels: boolean;
    numberFormat: string;
    dateFormat: string;
    showLabelsThreshold: number;
    roseType: 'radius' | 'area' | null;
    thresholdForOther: number;
  };

export enum EchartsPieLabelType {
  Key = 'key',
  Value = 'value',
  Percent = 'percent',
  KeyValue = 'key_value',
  KeyPercent = 'key_percent',
  KeyValuePercent = 'key_value_percent',
  ValuePercent = 'value_percent',
  Template = 'template',
}

export interface EchartsPieChartProps extends BaseChartProps<EchartsPieFormData> {
  formData: EchartsPieFormData;
}

// @ts-expect-error
export const DEFAULT_FORM_DATA: EchartsPieFormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  donut: false,
  groupby: [],
  innerRadius: 30,
  labelLine: false,
  labelType: EchartsPieLabelType.Key,
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  numberFormat: 'SMART_NUMBER',
  outerRadius: 70,
  showLabels: true,
  labelsOutside: true,
  showLabelsThreshold: 5,
  dateFormat: 'smart_date',
  roseType: null,
  thresholdForOther: 0,
};

export type PieChartTransformedProps =
  BaseTransformedProps<EchartsPieFormData> &
    ContextMenuTransformedProps &
    CrossFilterTransformedProps;

export interface PieChartDataItem {
  name: string;
  value: number;
  itemStyle: {
    color: string;
    opacity: number;
  };
  isOther?: boolean;
}
