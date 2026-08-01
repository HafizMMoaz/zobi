

import { SuperChart, VizType } from '@zobi-ui/core';
import { EchartsBoxPlotChartPlugin } from '@zobi-ui/plugin-chart-echarts';
import { dummyDatasource, withResizableChartDemo } from '@storybook-shared';
import data from './data';

new EchartsBoxPlotChartPlugin().configure({ key: 'box-plot' }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-preset-chart-nvd3/BoxPlot',
  decorators: [withResizableChartDemo],
  args: {
    colorScheme: 'd3Category10',
    whiskerOptions: 'Min/max (no outliers)',
  },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: [
        'zobiColors',
        'd3Category10',
        'bnbColors',
        'googleCategory20c',
      ],
    },
    whiskerOptions: {
      control: 'select',
      options: [
        'Tukey',
        'Min/max (no outliers)',
        '2/98 percentiles',
        '9/91 percentiles',
      ],
    },
  },
};

export const Basic = ({
  colorScheme,
  whiskerOptions,
  width,
  height,
}: {
  colorScheme: string;
  whiskerOptions: string;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="box-plot"
    width={width}
    height={height}
    datasource={dummyDatasource}
    queriesData={[{ data }]}
    formData={{
      color_scheme: colorScheme,
      viz_type: VizType.BoxPlot,
      whisker_options: whiskerOptions,
      groupby: ['region'],
      metrics: ['sum__SP_POP_TOTL'],
    }}
  />
);
