import { ControlComponentProps } from '@zobi-ui/chart-controls';

export type ZoomConfigs = ZoomConfigsFixed | ZoomConfigsLinear | ZoomConfigsExp;

export type ChartSizeValues = {
  [index: number]: { width: number; height: number };
};

export interface ZoomConfigsBase {
  type: string;
  configs: {
    zoom: number;
    width: number;
    height: number;
    slope?: number;
    exponent?: number;
  };
  values: ChartSizeValues;
}

export interface ZoomConfigsFixed extends ZoomConfigsBase {
  type: 'FIXED';
}

export interface ZoomConfigsLinear extends ZoomConfigsBase {
  type: 'LINEAR';
  configs: {
    zoom: number;
    width: number;
    height: number;
    slope: number;
    exponent?: number;
  };
}

export interface ZoomConfigsExp extends ZoomConfigsBase {
  type: 'EXP';
  configs: {
    zoom: number;
    width: number;
    height: number;
    slope?: number;
    exponent: number;
  };
}

export type ZoomConfigsControlProps = ControlComponentProps<ZoomConfigs>;

export interface CreateDragGraphicOptions {
  data: number[][];
  onWidthDrag: (...arg: any[]) => any;
  onHeightDrag: (...args: any[]) => any;
  barWidth: number;
  chart: any;
  fillColor?: string;
  strokeColor?: string;
}

export interface CreateDragGraphicOption {
  dataItem: number[];
  dataItemIndex: number;
  dataIndex: number;
  onDrag: (...arg: any[]) => any;
  barWidth: number;
  chart: any;
  add: boolean;
  fillColor?: string;
  strokeColor?: string;
}

export interface GetDragGraphicPositionOptions {
  chart: any;
  x: number;
  y: number;
  barWidth: number;
  add: boolean;
}

export type ZoomConfigsChartProps = ZoomConfigsControlProps;
