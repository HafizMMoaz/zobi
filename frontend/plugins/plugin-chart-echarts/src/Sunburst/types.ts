
import {
  ChartDataResponseResult,
  ChartProps,
  DataRecordValue,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@zobi-ui/core';
import type { SunburstSeriesNodeItemOption } from 'echarts/types/src/chart/sunburst/SunburstSeries';
import {
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
} from '../types';

export type EchartsSunburstFormData = QueryFormData & {
  groupby: QueryFormColumn[];
  metric: QueryFormMetric;
  secondaryMetric?: QueryFormMetric;
  colorScheme?: string;
  linearColorScheme?: string;
};

export enum EchartsSunburstLabelType {
  Key = 'key',
  Value = 'value',
  KeyValue = 'key_value',
}

export const DEFAULT_FORM_DATA: Partial<EchartsSunburstFormData> = {
  groupby: [],
  numberFormat: 'SMART_NUMBER',
  labelType: EchartsSunburstLabelType.Key,
  showLabels: false,
  dateFormat: 'smart_date',
};

export interface EchartsSunburstChartProps extends ChartProps<EchartsSunburstFormData> {
  formData: EchartsSunburstFormData;
  queriesData: ChartDataResponseResult[];
}

export type SunburstTransformedProps =
  BaseTransformedProps<EchartsSunburstFormData> &
    ContextMenuTransformedProps &
    CrossFilterTransformedProps;

export type NodeItemOption = SunburstSeriesNodeItemOption & {
  records: DataRecordValue[];
  secondaryValue: number;
};
