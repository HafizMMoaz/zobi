

import { SuperChart, getChartTransformPropsRegistry } from '@zobi-ui/core';
import {
  EchartsTreeChartPlugin,
  TreeTransformProps,
} from '@zobi-ui/plugin-chart-echarts';
import data from './data';
import { withResizableChartDemo } from '@storybook-shared';

new EchartsTreeChartPlugin().configure({ key: 'echarts-tree' }).register();

getChartTransformPropsRegistry().registerValue(
  'echarts-tree',
  TreeTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Tree',
  decorators: [withResizableChartDemo],
  args: {
    colorScheme: 'bnbColors',
    layout: 'orthogonal',
    orient: 'LR',
    symbol: 'circle',
    symbolSize: 7,
    roam: true,
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
    layout: {
      control: 'select',
      options: ['orthogonal', 'radial'],
      description: 'Layout type: orthogonal (rectangular) or radial (circular)',
    },
    orient: {
      control: 'select',
      options: ['LR', 'RL', 'TB', 'BT'],
      description:
        'Orientation: Left-Right, Right-Left, Top-Bottom, Bottom-Top',
    },
    symbol: {
      control: 'select',
      options: [
        'emptyCircle',
        'circle',
        'rect',
        'triangle',
        'diamond',
        'pin',
        'arrow',
      ],
    },
    symbolSize: {
      control: { type: 'range', min: 5, max: 30, step: 1 },
    },
    roam: {
      control: 'boolean',
      description: 'Enable zoom and pan',
    },
  },
};

export const Tree = ({
  colorScheme,
  layout,
  orient,
  symbol,
  symbolSize,
  roam,
  width,
  height,
}: {
  colorScheme: string;
  layout: string;
  orient: string;
  symbol: string;
  symbolSize: number;
  roam: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="echarts-tree"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      color_scheme: colorScheme,
      datasource: '3__table',
      granularity_sqla: 'ds',
      metric: 'count',
      id: 'id_column',
      root_node_id: '1',
      parent: 'parent_column',
      name: 'name_column',
      layout,
      orient,
      symbol,
      symbol_size: symbolSize,
      roam,
    }}
  />
);
