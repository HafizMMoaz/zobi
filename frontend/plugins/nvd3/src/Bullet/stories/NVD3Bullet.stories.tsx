import { SuperChart, VizType } from '@zobi.dev/core';
import { BulletChartPlugin } from '@zobi.dev/nvd3';
import { dummyDatasource, withResizableChartDemo } from '@storybook-shared';
import data from './data';

new BulletChartPlugin().configure({ key: VizType.Bullet }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-preset-chart-nvd3/Bullet',
  decorators: [withResizableChartDemo],
  args: {
    ranges: '0, 50, 75, 100',
    rangeLabels: 'Low, Medium, High',
    markers: '65',
    markerLabels: 'Target',
  },
  argTypes: {
    ranges: {
      control: 'text',
      description: 'Comma-separated range values',
    },
    rangeLabels: {
      control: 'text',
      description: 'Comma-separated range labels',
    },
    markers: {
      control: 'text',
      description: 'Comma-separated marker values',
    },
    markerLabels: {
      control: 'text',
      description: 'Comma-separated marker labels',
    },
  },
};

export const Basic = ({
  ranges,
  rangeLabels,
  markers,
  markerLabels,
  width,
  height,
}: {
  ranges: string;
  rangeLabels: string;
  markers: string;
  markerLabels: string;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType={VizType.Bullet}
    width={width}
    height={height}
    datasource={dummyDatasource}
    queriesData={[{ data }]}
    formData={{
      marker_labels: markerLabels,
      marker_line_labels: '',
      marker_lines: '',
      markers,
      range_labels: rangeLabels,
      ranges,
      viz_type: VizType.Bullet,
    }}
  />
);
