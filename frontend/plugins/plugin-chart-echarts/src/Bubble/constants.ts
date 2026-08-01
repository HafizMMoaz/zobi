import { DEFAULT_LEGEND_FORM_DATA } from '../constants';
import { defaultXAxis } from '../defaults';
import { EchartsBubbleFormData } from './types';

export const DEFAULT_FORM_DATA: Partial<EchartsBubbleFormData> = {
  ...DEFAULT_LEGEND_FORM_DATA,
  emitFilter: false,
  logXAis: false,
  logYAxis: false,
  xAxisTitleMargin: 40,
  yAxisTitleMargin: 50,
  truncateXAxis: false,
  truncateYAxis: false,
  xAxisBounds: [null, null],
  yAxisBounds: [null, null],
  xAxisLabelRotation: defaultXAxis.xAxisLabelRotation,
  xAxisLabelInterval: defaultXAxis.xAxisLabelInterval,
  opacity: 0.6,
};

export const MINIMUM_BUBBLE_SIZE = 5;
