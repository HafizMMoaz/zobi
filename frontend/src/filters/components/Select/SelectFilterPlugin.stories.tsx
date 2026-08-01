import { action } from '@storybook/addon-actions';
import { SuperChart, getChartTransformPropsRegistry } from '@zobi.dev/core';
import { mockQueryDataForCountries } from 'spec/fixtures/mockNativeFilters';
import SelectFilterPlugin from './index';
import transformProps from './transformProps';

new SelectFilterPlugin().configure({ key: 'filter_select' }).register();

getChartTransformPropsRegistry().registerValue('filter_select', transformProps);

export default {
  title: 'Components/Filter Plugins',
  argTypes: {
    creatable: { control: 'boolean', defaultValue: true },
    multiSelect: { control: 'boolean', defaultValue: true },
    inverseSelection: { control: 'boolean', defaultValue: false },
  },
};

export const Select = ({
  creatable,
  multiSeelct,
  inverseSelection,
  width,
  height,
}: {
  creatable: boolean;
  multiSeelct: boolean;
  inverseSelection: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="filter_select"
    width={width}
    height={height}
    queriesData={[{ data: mockQueryDataForCountries }]}
    formData={{
      adhoc_filters: [],
      extra_filters: [],
      creatable,
      multiSelect: { multiSeelct },
      inverseSelection: { inverseSelection },
      row_limit: 1000,
      viz_type: 'filter_select',
      groupby: ['country_name'],
      metrics: ['SUM(SP_POP_TOTL)'],
    }}
    hooks={{
      setDataMask: action('setDataMask'),
    }}
  />
);
