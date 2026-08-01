import { SuperChart, VizType } from '@zobi.dev/core';
import { BigNumberTotalChartPlugin } from '@zobi.dev/echarts';
import { withResizableChartDemo } from '@storybook-shared';
import data from './data';

new BigNumberTotalChartPlugin()
  .configure({ key: 'big-number-total' })
  .register();

export default {
  title: 'Legacy Chart Plugins/legacy-preset-big-number/BigNumberTotal',
  decorators: [withResizableChartDemo],
  args: {
    subheader: 'total female participants',
    yAxisFormat: '.3s',
    forceTimestampFormatting: false,
  },
  argTypes: {
    subheader: { control: 'text' },
    yAxisFormat: {
      control: 'select',
      options: ['SMART_NUMBER', '.2f', '.0%', '$,.2f', '.3s', ',d'],
    },
    forceTimestampFormatting: { control: 'boolean' },
  },
};

export const TotalBasic = ({
  subheader,
  yAxisFormat,
  forceTimestampFormatting,
  width,
  height,
}: {
  subheader: string;
  yAxisFormat: string;
  forceTimestampFormatting: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="big-number-total"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      metric: 'sum__num',
      subheader,
      viz_type: VizType.BigNumberTotal,
      y_axis_format: yAxisFormat,
      force_timestamp_formatting: forceTimestampFormatting,
    }}
  />
);

export const TotalNoData = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="big-number-total"
    width={width}
    height={height}
    queriesData={[{ data: [] }]}
    formData={{
      metric: 'sum__num',
      subheader: 'total female participants',
      viz_type: VizType.BigNumberTotal,
      y_axis_format: '.3s',
    }}
  />
);
