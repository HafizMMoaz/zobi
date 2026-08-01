

import { SuperChart, getChartTransformPropsRegistry } from '@zobi.dev/core';
import AgGridTableChartPlugin from '../index';
import transformProps from '../transformProps';
import { basicFormData, basicData } from './data';
import { withResizableChartDemo } from '@storybook-shared';

const VIZ_TYPE = 'ag-grid-table';

new AgGridTableChartPlugin().configure({ key: VIZ_TYPE }).register();

getChartTransformPropsRegistry().registerValue(VIZ_TYPE, transformProps);

export default {
  title: 'Chart Plugins/plugin-chart-ag-grid-table',
  decorators: [withResizableChartDemo],
  args: {
    includeSearch: true,
    showCellBars: true,
    alignPn: false,
    colorPn: true,
  },
  argTypes: {
    includeSearch: {
      control: 'boolean',
      description: 'Show search box',
    },
    showCellBars: {
      control: 'boolean',
      description: 'Show cell bars for numeric columns',
    },
    alignPn: {
      control: 'boolean',
      description: 'Align positive/negative values',
    },
    colorPn: {
      control: 'boolean',
      description: 'Color positive/negative values',
    },
  },
};

export const Basic = ({
  includeSearch,
  showCellBars,
  alignPn,
  colorPn,
  width,
  height,
}: {
  includeSearch: boolean;
  showCellBars: boolean;
  alignPn: boolean;
  colorPn: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType={VIZ_TYPE}
    width={width}
    height={height}
    datasource={{
      columnFormats: {},
      verboseMap: {},
    }}
    queriesData={[basicData]}
    formData={{
      ...basicFormData,
      include_search: includeSearch,
      show_cell_bars: showCellBars,
      align_pn: alignPn,
      color_pn: colorPn,
    }}
  />
);

Basic.parameters = {
  initialSize: {
    width: 680,
    height: 420,
  },
};
