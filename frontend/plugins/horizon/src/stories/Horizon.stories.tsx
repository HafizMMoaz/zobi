import { SuperChart, VizType } from '@zobi.dev/core';
import HorizonChartPlugin from '@zobi.dev/horizon';
import { withResizableChartDemo } from '@storybook-shared';
import data from './data';

new HorizonChartPlugin().configure({ key: VizType.Horizon }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-plugin-chart-horizon',
  decorators: [withResizableChartDemo],
  args: {
    horizonColorScale: 'series',
    seriesHeight: 25,
  },
  argTypes: {
    horizonColorScale: {
      control: 'select',
      options: ['series', 'overall', 'change'],
    },
    seriesHeight: {
      control: { type: 'range', min: 10, max: 100, step: 5 },
      description: 'Height of each series row in pixels',
    },
  },
};

export const Basic = ({
  horizonColorScale,
  seriesHeight,
  width,
  height,
}: {
  horizonColorScale: string;
  seriesHeight: number;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType={VizType.Horizon}
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      horizon_color_scale: horizonColorScale,
      series_height: String(seriesHeight),
    }}
  />
);
