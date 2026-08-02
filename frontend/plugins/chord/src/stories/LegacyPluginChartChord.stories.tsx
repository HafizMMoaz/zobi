import { SuperChart, VizType } from '@zobi.dev/core';
import ChordChartPlugin from '@zobi.dev/chord';
import data from './data';
import { withResizableChartDemo } from '@storybook-shared';

new ChordChartPlugin().configure({ key: VizType.Chord }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-plugin-chart-chord',
  decorators: [withResizableChartDemo],
  args: {
    colorScheme: 'd3Category10',
    yAxisFormat: '.2f',
    sortByMetric: true,
  },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['zobiColors', 'd3Category10', 'bnbColors', 'googleCategory20c'],
    },
    yAxisFormat: {
      control: 'select',
      options: ['SMART_NUMBER', '.2f', '.0%', '$,.2f', '.3s', ',d'],
    },
    sortByMetric: {
      control: 'boolean',
      description: 'Sort arcs by metric value',
    },
  },
};

export const Basic = ({
  width,
  height,
  colorScheme,
  yAxisFormat,
  sortByMetric,
}: {
  width: number;
  height: number;
  colorScheme: string;
  yAxisFormat: string;
  sortByMetric: boolean;
}) => (
  <SuperChart
    chartType={VizType.Chord}
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      color_scheme: colorScheme,
      y_axis_format: yAxisFormat,
      sort_by_metric: sortByMetric,
    }}
  />
);
