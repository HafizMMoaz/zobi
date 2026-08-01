

import {
  SuperChart,
  VizType,
  getChartTransformPropsRegistry,
} from '@zobi.dev/core';
import {
  EchartsRadarChartPlugin,
  RadarTransformProps,
} from '@zobi.dev/echarts';
import { withResizableChartDemo } from '@storybook-shared';
import { basic } from './data';

new EchartsRadarChartPlugin().configure({ key: VizType.Radar }).register();

getChartTransformPropsRegistry().registerValue(
  VizType.Radar,
  RadarTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Radar',
  decorators: [withResizableChartDemo],
  args: {
    colorScheme: 'zobiColors',
    showLegend: true,
    isCircle: false,
    labelType: 'key',
    showLabels: true,
    numberFormat: 'SMART_NUMBER',
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
    showLegend: { control: 'boolean' },
    isCircle: {
      control: 'boolean',
      description: 'If true, radar shape is circle; otherwise polygon',
    },
    labelType: {
      control: 'select',
      options: ['key', 'value', 'percent', 'key_value', 'key_percent'],
    },
    showLabels: { control: 'boolean' },
    numberFormat: {
      control: 'select',
      options: ['SMART_NUMBER', '.2f', '.0%', '$,.2f', '.3s'],
    },
  },
};

export const Radar = ({
  width,
  height,
  colorScheme,
  showLegend,
  isCircle,
  labelType,
  showLabels,
  numberFormat,
}: {
  width: number;
  height: number;
  colorScheme: string;
  showLegend: boolean;
  isCircle: boolean;
  labelType: string;
  showLabels: boolean;
  numberFormat: string;
}) => (
  <SuperChart
    chartType={VizType.Radar}
    width={width}
    height={height}
    queriesData={[{ data: basic }]}
    formData={{
      columns: [],
      groupby: ['Sales'],
      metrics: [
        'Sales',
        'Administration',
        'Information Technology',
        'Customer Support',
        'Development',
        'Marketing',
      ],
      column_config: {
        Sales: { radarMetricMaxValue: 6500 },
        Administration: { radarMetricMaxValue: 16000 },
        'Information Technology': { radarMetricMaxValue: 30000 },
        'Customer Support': { radarMetricMaxValue: 38000 },
        Development: { radarMetricMaxValue: 52000 },
        Marketing: { radarMetricMaxValue: 25000 },
      },
      color_scheme: colorScheme,
      show_legend: showLegend,
      is_circle: isCircle,
      label_type: labelType,
      show_labels: showLabels,
      number_format: numberFormat,
    }}
  />
);
