

import { SuperChart, getChartTransformPropsRegistry } from '@zobi-ui/core';
import {
  EchartsBoxPlotChartPlugin,
  BoxPlotTransformProps,
} from '@zobi-ui/plugin-chart-echarts';
import data from './data';
import { withResizableChartDemo } from '@storybook-shared';

new EchartsBoxPlotChartPlugin()
  .configure({ key: 'echarts-boxplot' })
  .register();

getChartTransformPropsRegistry().registerValue(
  'echarts-boxplot',
  BoxPlotTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/BoxPlot',
  decorators: [withResizableChartDemo],
  args: {
    xTicksLayout: '45°', // Initial value
  },
  argTypes: {
    xTicksLayout: {
      control: 'select',
      options: ['auto', 'flat', '45°', '90°', 'staggered'],
      defaultValue: '45°', // Default value here
    },
  },
};

export const BoxPlot = ({
  xTicksLayout,
  width,
  height,
}: {
  xTicksLayout: string;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="echarts-boxplot"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      columns: [],
      groupby: ['type', 'region'],
      metrics: ['AVG(averageprice)'],
      whiskerOptions: 'Tukey',
      xTicksLayout,
      yAxisFormat: 'SMART_NUMBER',
    }}
  />
);
