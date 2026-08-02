import { SuperChart, getChartTransformPropsRegistry } from '@zobi.dev/core';
import {
  EchartsTreemapChartPlugin,
  TreemapTransformProps,
} from '@zobi.dev/echarts';
import data from './data';
import { withResizableChartDemo } from '@storybook-shared';

new EchartsTreemapChartPlugin()
  .configure({ key: 'echarts-treemap' })
  .register();

getChartTransformPropsRegistry().registerValue(
  'echarts-treemap',
  TreemapTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Treemap',
  decorators: [withResizableChartDemo],
};

export const Treemap = ({
  showLabels,
  showUpperLabels,
  labelType,
  width,
  height,
}: {
  showLabels: boolean;
  showUpperLabels: boolean;
  labelType: string;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="echarts-treemap"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      colorScheme: 'zobiColors',
      groupby: ['genre'],
      metric: 'count',
      showLabels,
      showUpperLabels,
      labelType,
    }}
  />
);

Treemap.args = {
  showLabels: true,
  showUpperLabels: true,
  labelType: 'key_value',
};

Treemap.argTypes = {
  showLabels: { control: 'boolean' },
  showUpperLabels: { control: 'boolean' },
  labelType: {
    control: 'select',
    options: ['key', 'value', 'key_value'],
  },
};
