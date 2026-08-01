import {
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@zobi.dev/core';
import {
  BaseChartProps,
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
  LegendFormData,
  LabelPositionEnum,
  LegendOrientation,
  LegendType,
} from '../types';
import { DEFAULT_LEGEND_FORM_DATA } from '../constants';

type RadarColumnConfig = Record<
  string,
  { radarMetricMaxValue?: number | null; radarMetricMinValue?: number }
>;

export type EchartsRadarFormData = QueryFormData &
  LegendFormData & {
    colorScheme?: string;
    columnConfig?: RadarColumnConfig;
    currentOwnValue?: string[] | null;
    currentValue?: string[] | null;
    defaultValue?: string[] | null;
    groupby: QueryFormColumn[];
    labelType: EchartsRadarLabelType;
    labelPosition: LabelPositionEnum;
    metrics: QueryFormMetric[];
    showLabels: boolean;
    isCircle: boolean;
    numberFormat: string;
    dateFormat: string;
    isNormalized: boolean;
  };

export enum EchartsRadarLabelType {
  Value = 'value',
  KeyValue = 'key_value',
}

export interface EchartsRadarChartProps extends BaseChartProps<EchartsRadarFormData> {
  formData: EchartsRadarFormData;
}

// @ts-expect-error
export const DEFAULT_FORM_DATA: EchartsRadarFormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  groupby: [],
  labelType: EchartsRadarLabelType.Value,
  labelPosition: LabelPositionEnum.Top,
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  numberFormat: 'SMART_NUMBER',
  showLabels: true,
  dateFormat: 'smart_date',
  isCircle: false,
};

export type RadarChartTransformedProps =
  BaseTransformedProps<EchartsRadarFormData> &
    ContextMenuTransformedProps &
    CrossFilterTransformedProps;

/**
 * Represents a mapping from a normalized value (as string) to an original numeric value.
 */
interface NormalizedValueMap {
  [normalized: string]: number;
}

/**
 * Represents a collection of series, each containing its own NormalizedValueMap.
 */
export interface SeriesNormalizedMap {
  [seriesName: string]: NormalizedValueMap;
}
