import { SuperChart, getChartTransformPropsRegistry } from '@zobi.dev/core';
import {
  EchartsSunburstChartPlugin,
  SunburstTransformProps,
} from '@zobi.dev/echarts';
import { withResizableChartDemo } from '@storybook-shared';
import data from './data';

new EchartsSunburstChartPlugin()
  .configure({ key: 'echarts-sunburst' })
  .register();

getChartTransformPropsRegistry().registerValue(
  'echarts-sunburst',
  SunburstTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Sunburst',
  decorators: [withResizableChartDemo],
};

export const Sunburst = ({
  showLabels,
  showTotal,
  width,
  height,
}: {
  showLabels: boolean;
  showTotal: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="echarts-sunburst"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      columns: ['genre', 'platform'],
      metric: 'count',
      showLabels,
      showTotal,
    }}
  />
);
Sunburst.args = {
  showLabels: true,
  showTotal: true,
};
Sunburst.argTypes = {
  showLabels: { control: 'boolean' },
  showTotal: { control: 'boolean' },
};
