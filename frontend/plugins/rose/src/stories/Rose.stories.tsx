/* eslint-disable no-magic-numbers, sort-keys */
import { SuperChart, VizType } from '@zobi.dev/core';
import RoseChartPlugin from '@zobi.dev/rose';
import data from './data';
import { withResizableChartDemo } from '@storybook-shared';

new RoseChartPlugin().configure({ key: VizType.Rose }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-plugin-chart-rose',
  decorators: [withResizableChartDemo],
  args: {
    colorScheme: 'd3Category10',
    numberFormat: '.3s',
    dateTimeFormat: '%Y-%m-%d',
    richTooltip: true,
    roseAreaProportion: false,
  },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['zobiColors', 'd3Category10', 'bnbColors', 'googleCategory20c'],
    },
    numberFormat: {
      control: 'select',
      options: ['SMART_NUMBER', '.2f', '.0%', '$,.2f', '.3s', ',d'],
    },
    dateTimeFormat: {
      control: 'select',
      options: ['%Y-%m-%d', '%Y-%m-%d %H:%M', '%b %d, %Y', '%d/%m/%Y'],
    },
    richTooltip: { control: 'boolean' },
    roseAreaProportion: {
      control: 'boolean',
      description:
        'When true, area is proportional to value; when false, radius is proportional',
    },
  },
};

export const Basic = ({
  width,
  height,
  colorScheme,
  numberFormat,
  dateTimeFormat,
  richTooltip,
  roseAreaProportion,
}: {
  width: number;
  height: number;
  colorScheme: string;
  numberFormat: string;
  dateTimeFormat: string;
  richTooltip: boolean;
  roseAreaProportion: boolean;
}) => (
  <SuperChart
    chartType={VizType.Rose}
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      color_scheme: colorScheme,
      date_time_format: dateTimeFormat,
      number_format: numberFormat,
      rich_tooltip: richTooltip,
      rose_area_proportion: roseAreaProportion,
    }}
  />
);
