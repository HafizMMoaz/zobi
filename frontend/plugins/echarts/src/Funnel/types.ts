import { QueryFormData } from '@zobi.dev/core';
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

export type EchartsFunnelFormData = QueryFormData &
  LegendFormData & {
    colorScheme?: string;
    groupby: QueryFormData[];
    labelLine: boolean;
    labelType: EchartsFunnelLabelType;
    tooltipLabelType: EchartsFunnelLabelType;
    metric?: string;
    showLabels: boolean;
    showTooltipLabels: boolean;
    numberFormat: string;
    gap: number;
    sort: 'descending' | 'ascending' | 'none' | undefined;
    orient: 'vertical' | 'horizontal' | undefined;
    percentCalculationType: PercentCalcType;
  };

export enum EchartsFunnelLabelType {
  Key,
  Value,
  Percent,
  KeyValue,
  KeyPercent,
  KeyValuePercent,
  ValuePercent,
}

export interface EchartsFunnelChartProps extends BaseChartProps<EchartsFunnelFormData> {
  formData: EchartsFunnelFormData;
}

// @ts-expect-error
export const DEFAULT_FORM_DATA: EchartsFunnelFormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  groupby: [],
  labelLine: false,
  labelType: EchartsFunnelLabelType.Key,
  defaultTooltipLabel: EchartsFunnelLabelType.KeyValuePercent,
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  numberFormat: 'SMART_NUMBER',
  showLabels: true,
  sort: 'descending',
  orient: 'vertical',
  gap: 0,
};

export type FunnelChartTransformedProps =
  BaseTransformedProps<EchartsFunnelFormData> &
    CrossFilterTransformedProps &
    ContextMenuTransformedProps;

export enum PercentCalcType {
  Total = 'total',
  PreviousStep = 'prev_step',
  FirstStep = 'first_step',
}
