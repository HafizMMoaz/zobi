
import {
  SuperChart,
  VizType,
  getChartTransformPropsRegistry,
} from '@zobi-ui/core';
import {
  EchartsWaterfallChartPlugin,
  WaterfallTransformProps,
} from '@zobi-ui/plugin-chart-echarts';
import data from './data';
import { withResizableChartDemo } from '@storybook-shared';

new EchartsWaterfallChartPlugin()
  .configure({ key: VizType.Waterfall })
  .register();

getChartTransformPropsRegistry().registerValue(
  VizType.Waterfall,
  WaterfallTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts/Waterfall',
  decorators: [withResizableChartDemo],
  args: {
    xTicksLayout: '45°',
    showLegend: true,
    showValue: true,
    richTooltip: true,
    yAxisFormat: 'SMART_NUMBER',
  },
  argTypes: {
    xTicksLayout: {
      control: 'select',
      options: ['auto', 'flat', '45°', '90°', 'staggered'],
    },
    showLegend: { control: 'boolean' },
    showValue: { control: 'boolean' },
    richTooltip: { control: 'boolean' },
    yAxisFormat: {
      control: 'select',
      options: ['SMART_NUMBER', '.2f', '.0%', '$,.2f', '.3s', ',d'],
    },
  },
};

export const Waterfall = ({
  width,
  height,
  xTicksLayout,
  showLegend,
  showValue,
  richTooltip,
  yAxisFormat,
}: {
  width: number;
  height: number;
  xTicksLayout: string;
  showLegend: boolean;
  showValue: boolean;
  richTooltip: boolean;
  yAxisFormat: string;
}) => (
  <SuperChart
    chartType={VizType.Waterfall}
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      metric: `SUM(decomp_volume)`,
      columns: 'due_to_group',
      series: 'period',
      x_ticks_layout: xTicksLayout,
      show_legend: showLegend,
      show_value: showValue,
      rich_tooltip: richTooltip,
      y_axis_format: yAxisFormat,
      adhocFilters: [
        {
          clause: 'WHERE',
          comparator: '0',
          expressionType: 'SIMPLE',
          filterOptionName: 'filter_8ix98su8zu4_t4767ixmbp9',
          isExtra: false,
          isNew: false,
          operator: '!=',
          sqlExpression: null,
          subject: 'period',
        },
      ],
    }}
  />
);
