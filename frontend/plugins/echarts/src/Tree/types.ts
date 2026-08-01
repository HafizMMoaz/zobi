import type { OptionName } from 'echarts/types/src/util/types';
import type { TreeSeriesNodeItemOption } from 'echarts/types/src/chart/tree/TreeSeries';
import { ChartDataResponseResult, QueryFormData } from '@zobi.dev/core';
import { BaseChartProps, BaseTransformedProps } from '../types';

export type EchartsTreeFormData = QueryFormData & {
  id: string;
  parent: string;
  name: string;
  rootNodeId?: string | number;
  orient: 'LR' | 'RL' | 'TB' | 'BT';
  symbol: string;
  symbolSize: number;
  colorScheme?: string;
  metric?: string;
  layout: 'orthogonal' | 'radial';
  roam: boolean | 'scale' | 'move';
  nodeLabelPosition: 'top' | 'bottom' | 'left' | 'right';
  childLabelPosition: 'top' | 'bottom' | 'left' | 'right';
  emphasis: 'none' | 'ancestor' | 'descendant';
  initialTreeDepth: number;
};

export interface TreeChartDataResponseResult extends ChartDataResponseResult {
  data: TreeDataRecord[];
}

export interface EchartsTreeChartProps extends BaseChartProps<EchartsTreeFormData> {
  formData: EchartsTreeFormData;
  queriesData: TreeChartDataResponseResult[];
}

export type TreeDataRecord = Record<string, OptionName> & {
  children?: TreeSeriesNodeItemOption[];
};

export type TreeTransformedProps = BaseTransformedProps<EchartsTreeFormData>;
