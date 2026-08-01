

import {
  SuperChart,
  VizType,
  getChartTransformPropsRegistry,
} from '@zobi-ui/core';
import {
  EchartsFunnelChartPlugin,
  FunnelTransformProps,
} from '@zobi-ui/plugin-chart-echarts';
import { dataSource } from './constants';
import { withResizableChartDemo } from '@storybook-shared';

new EchartsFunnelChartPlugin().configure({ key: VizType.Funnel }).register();

getChartTransformPropsRegistry().registerValue(
  VizType.Funnel,
  FunnelTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Funnel',
  decorators: [withResizableChartDemo],
  args: {
    orient: 'vertical',
    sort: 'descending',
    gap: 0,
    labelType: 'key',
    labelLine: true,
    showLabels: true,
    showLegend: false,
  },
  argTypes: {
    width: { control: 'number' },
    height: { control: 'number' },
    orient: { control: 'select', options: ['horizontal', 'vertical'] },
    sort: { control: 'select', options: ['descending', 'ascending', 'none'] },
    gap: { control: 'number' },
    labelType: {
      control: 'select',
      options: [
        'key',
        'value',
        'percent',
        'key_value',
        'key_percent',
        'key_value_percent',
      ],
    },
    labelLine: { control: 'boolean' },
    showLabels: { control: 'boolean' },
    showLegend: { control: 'boolean' },
  },
};

export const Funnel = ({
  orient,
  sort,
  gap,
  labelType,
  labelLine,
  showLabels,
  showLegend,
  width,
  height,
}: {
  orient: string;
  sort: string;
  gap: number;
  labelType: string;
  labelLine: boolean;
  showLabels: boolean;
  showLegend: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType={VizType.Funnel}
    width={width}
    height={height}
    queriesData={[{ data: dataSource }]}
    formData={{
      colorScheme: 'zobiColors',
      groupby: ['name'],
      metric: 'value',
      numberFormat: 'SMART_NUMBER',
      orient,
      sort,
      gap,
      labelType,
      labelLine,
      showLabels,
      showLegend,
    }}
  />
);
