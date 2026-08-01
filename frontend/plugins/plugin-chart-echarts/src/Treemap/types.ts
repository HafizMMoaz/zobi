import {
  ChartDataResponseResult,
  ChartProps,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@zobi-ui/core';
import type { CallbackDataParams } from 'echarts/types/src/util/types';
import {
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
  LabelPositionEnum,
  TreePathInfo,
} from '../types';

export type EchartsTreemapFormData = QueryFormData & {
  colorScheme?: string;
  groupby: QueryFormColumn[];
  metric?: QueryFormMetric;
  labelType: EchartsTreemapLabelType;
  labelPosition: LabelPositionEnum;
  showLabels: boolean;
  showUpperLabels: boolean;
  numberFormat: string;
  dateFormat: string;
  dashboardId?: number;
};

export enum EchartsTreemapLabelType {
  Key = 'key',
  Value = 'value',
  KeyValue = 'key_value',
}

export interface EchartsTreemapChartProps extends ChartProps<EchartsTreemapFormData> {
  formData: EchartsTreemapFormData;
  queriesData: ChartDataResponseResult[];
}

export const DEFAULT_FORM_DATA: Partial<EchartsTreemapFormData> = {
  groupby: [],
  labelType: EchartsTreemapLabelType.KeyValue,
  labelPosition: LabelPositionEnum.InsideTopLeft,
  numberFormat: 'SMART_NUMBER',
  showLabels: true,
  showUpperLabels: true,
  dateFormat: 'smart_date',
};
export interface TreemapSeriesCallbackDataParams extends CallbackDataParams {
  treePathInfo?: TreePathInfo[];
}

export type TreemapTransformedProps =
  BaseTransformedProps<EchartsTreemapFormData> &
    ContextMenuTransformedProps &
    CrossFilterTransformedProps;
