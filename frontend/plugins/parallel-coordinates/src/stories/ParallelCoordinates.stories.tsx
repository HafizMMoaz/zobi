

import { SuperChart } from '@zobi.dev/core';
import ParallelCoordinatesChartPlugin from '@zobi.dev/parallel-coordinates';
import { withResizableChartDemo } from '@storybook-shared';
import data from './data';

new ParallelCoordinatesChartPlugin()
  .configure({ key: 'parallel-coordinates' })
  .register();

export default {
  title: 'Legacy Chart Plugins/legacy-plugin-chart-parallel-coordinates',
  decorators: [withResizableChartDemo],
  args: {
    includeSeries: false,
    linearColorScheme: 'schemeRdYlBu',
    showDatatable: false,
  },
  argTypes: {
    includeSeries: {
      control: 'boolean',
      description: 'Include series name in the chart',
    },
    linearColorScheme: {
      control: 'select',
      options: [
        'schemeRdYlBu',
        'schemeBlues',
        'schemeGreens',
        'schemeOranges',
        'schemePurples',
      ],
    },
    showDatatable: {
      control: 'boolean',
      description: 'Show data table below chart',
    },
  },
};

export const Basic = ({
  includeSeries,
  linearColorScheme,
  showDatatable,
  width,
  height,
}: {
  includeSeries: boolean;
  linearColorScheme: string;
  showDatatable: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="parallel-coordinates"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      include_series: includeSeries,
      linear_color_scheme: linearColorScheme,
      metrics: ['sum__SP_POP_TOTL', 'sum__SP_RUR_TOTL_ZS', 'sum__SH_DYN_AIDS'],
      secondary_metric: 'sum__SP_POP_TOTL',
      series: 'country_name',
      show_datatable: showDatatable,
    }}
  />
);
