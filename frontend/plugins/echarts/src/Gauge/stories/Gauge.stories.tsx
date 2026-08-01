

import { SuperChart, getChartTransformPropsRegistry } from '@zobi.dev/core';
import {
  EchartsGaugeChartPlugin,
  GaugeTransformProps,
} from '@zobi.dev/echarts';
import { withResizableChartDemo } from '@storybook-shared';
import { speed } from './data';

new EchartsGaugeChartPlugin().configure({ key: 'echarts-gauge' }).register();

getChartTransformPropsRegistry().registerValue(
  'echarts-gauge',
  GaugeTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Gauge',
  decorators: [withResizableChartDemo],
  args: {
    colorScheme: 'zobiColors',
    showProgress: true,
    showPointer: true,
    splitNumber: 10,
    numberFormat: 'SMART_NUMBER',
    minVal: 0,
    maxVal: 100,
    startAngle: 225,
    endAngle: -45,
  },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: [
        'zobiColors',
        'd3Category10',
        'bnbColors',
        'googleCategory20c',
      ],
    },
    showProgress: { control: 'boolean' },
    showPointer: { control: 'boolean' },
    splitNumber: { control: { type: 'range', min: 2, max: 20, step: 1 } },
    numberFormat: {
      control: 'select',
      options: ['SMART_NUMBER', '.2f', '.0%', '$,.2f', '.3s'],
    },
    minVal: { control: 'number' },
    maxVal: { control: 'number' },
    startAngle: { control: { type: 'range', min: 0, max: 360, step: 15 } },
    endAngle: { control: { type: 'range', min: -360, max: 0, step: 15 } },
  },
};

export const Gauge = ({
  width,
  height,
  colorScheme,
  showProgress,
  showPointer,
  splitNumber,
  numberFormat,
  minVal,
  maxVal,
  startAngle,
  endAngle,
}: {
  width: number;
  height: number;
  colorScheme: string;
  showProgress: boolean;
  showPointer: boolean;
  splitNumber: number;
  numberFormat: string;
  minVal: number;
  maxVal: number;
  startAngle: number;
  endAngle: number;
}) => (
  <SuperChart
    chartType="echarts-gauge"
    width={width}
    height={height}
    queriesData={[{ data: speed }]}
    formData={{
      columns: [],
      groupby: ['name'],
      metric: 'value',
      colorScheme,
      showProgress,
      showPointer,
      splitNumber,
      numberFormat,
      minVal,
      maxVal,
      startAngle,
      endAngle,
    }}
  />
);
