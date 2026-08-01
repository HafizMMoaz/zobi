import { action } from '@storybook/addon-actions';
import { SuperChart, getChartTransformPropsRegistry } from '@zobi-ui/core';
import { GenericDataType } from '@zobi/core/common';
import RangeFilterPlugin from './index';
import transformProps from './transformProps';

new RangeFilterPlugin().configure({ key: 'filter_range' }).register();

getChartTransformPropsRegistry().registerValue('filter_range', transformProps);

export default {
  title: 'Components/Filter Plugins',
};

export const range = ({ width, height }: { width: number; height: number }) => (
  <SuperChart
    chartType="filter_range"
    width={width}
    height={height}
    queriesData={[{ data: [{ min: 10, max: 100 }] }]}
    filterState={{ value: [10, 70] }}
    formData={{
      groupby: ['SP_POP_TOTL'],
      adhoc_filters: [],
      extra_filters: [],
      viz_type: 'filter_range',
      metrics: [
        {
          aggregate: 'MIN',
          column: {
            column_name: 'SP_POP_TOTL',
            id: 1,
            type_generic: GenericDataType.Numeric,
          },
          expressionType: 'SIMPLE',
          hasCustomLabel: true,
          label: 'min',
        },
        {
          aggregate: 'MAX',
          column: {
            column_name: 'SP_POP_TOTL',
            id: 2,
            type_generic: GenericDataType.Numeric,
          },
          expressionType: 'SIMPLE',
          hasCustomLabel: true,
          label: 'max',
        },
      ],
    }}
    hooks={{
      setDataMask: action('setDataMask'),
    }}
  />
);
