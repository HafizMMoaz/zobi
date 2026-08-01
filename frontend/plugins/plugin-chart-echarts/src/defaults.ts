import { LegendOrientation } from './types';

export const defaultGrid = {
  containLabel: true,
};

export const defaultYAxis = {
  scale: true,
  yAxisLabelRotation: 0,
};

export const defaultXAxis = {
  xAxisLabelRotation: 0,
  xAxisLabelInterval: 'auto',
};

export const defaultLegendPadding = {
  [LegendOrientation.Top]: 20,
  [LegendOrientation.Bottom]: 20,
  [LegendOrientation.Left]: 170,
  [LegendOrientation.Right]: 170,
};
