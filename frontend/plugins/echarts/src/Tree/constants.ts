import type { TreeSeriesOption } from 'echarts/charts';
import { EchartsTreeFormData } from './types';

export const DEFAULT_TREE_SERIES_OPTION: TreeSeriesOption = {
  label: {
    position: 'left',
    fontSize: 15,
  },
  animation: true,
  animationDuration: 500,
  animationEasing: 'cubicOut',
};

export const DEFAULT_FORM_DATA: Partial<EchartsTreeFormData> = {
  id: '',
  parent: '',
  name: '',
  rootNodeId: '',
  layout: 'orthogonal',
  orient: 'LR',
  symbol: 'emptyCircle',
  symbolSize: 7,
  roam: true,
  nodeLabelPosition: 'left',
  childLabelPosition: 'bottom',
  emphasis: 'descendant',
  initialTreeDepth: 2,
};
