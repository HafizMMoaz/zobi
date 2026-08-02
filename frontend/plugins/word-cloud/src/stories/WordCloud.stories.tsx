import { SuperChart } from '@zobi.dev/core';
import { WordCloudChartPlugin } from '@zobi.dev/word-cloud';
import { withResizableChartDemo } from '@storybook-shared';
import data from './data';

new WordCloudChartPlugin().configure({ key: 'word-cloud2' }).register();

export default {
  title: 'Chart Plugins/plugin-chart-word-cloud',
  decorators: [withResizableChartDemo],
  args: {
    rotation: 'flat',
    colorScheme: 'd3Category10',
    sizeFrom: 10,
    sizeTo: 70,
  },
  argTypes: {
    rotation: {
      control: 'select',
      options: ['square', 'flat', 'random'],
    },
    colorScheme: {
      control: 'select',
      options: ['zobiColors', 'd3Category10', 'bnbColors', 'googleCategory20c'],
    },
    sizeFrom: {
      control: { type: 'range', min: 5, max: 50, step: 5 },
      description: 'Minimum font size',
    },
    sizeTo: {
      control: { type: 'range', min: 20, max: 150, step: 5 },
      description: 'Maximum font size',
    },
  },
};

export const Basic = ({
  rotation,
  colorScheme,
  sizeFrom,
  sizeTo,
  width,
  height,
}: {
  rotation: string;
  colorScheme: string;
  sizeFrom: number;
  sizeTo: number;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="word-cloud2"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      color_scheme: colorScheme,
      metric: 'sum__num',
      series: 'name',
      rotation,
      size_from: sizeFrom,
      size_to: sizeTo,
    }}
  />
);
