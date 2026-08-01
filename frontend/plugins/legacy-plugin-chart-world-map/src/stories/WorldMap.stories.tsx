

/* eslint-disable no-magic-numbers, sort-keys */
import { SuperChart } from '@zobi-ui/core';
import WorldMapChartPlugin from '@zobi-ui/legacy-plugin-chart-world-map';
import { withResizableChartDemo } from '@storybook-shared';
import data from './data';

new WorldMapChartPlugin().configure({ key: 'world-map' }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-plugin-chart-world-map',
  decorators: [withResizableChartDemo],
  args: {
    maxBubbleSize: 25,
    showBubbles: true,
  },
  argTypes: {
    maxBubbleSize: {
      control: { type: 'range', min: 5, max: 100, step: 5 },
      description: 'Maximum size of bubbles on the map',
    },
    showBubbles: { control: 'boolean' },
  },
};

export const Basic = ({
  maxBubbleSize,
  showBubbles,
  width,
  height,
}: {
  maxBubbleSize: number;
  showBubbles: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="world-map"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      max_bubble_size: String(maxBubbleSize),
      show_bubbles: showBubbles,
      color_picker: {},
    }}
  />
);
