/* eslint-disable no-magic-numbers */
import { SuperChart } from '@zobi.dev/core';
import PairedTTestChartPlugin from '@zobi.dev/paired-t-test';
import { withResizableChartDemo } from '@storybook-shared';
import data from './data';

new PairedTTestChartPlugin().configure({ key: 'paired-t-test' }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-plugin-chart-paired-t-test',
  decorators: [withResizableChartDemo],
  args: {
    liftvaluePrecision: 4,
    pvaluePrecision: 6,
    significanceLevel: 0.05,
  },
  argTypes: {
    liftvaluePrecision: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Decimal precision for lift values',
    },
    pvaluePrecision: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Decimal precision for p-values',
    },
    significanceLevel: {
      control: { type: 'range', min: 0.01, max: 0.2, step: 0.01 },
      description: 'Statistical significance threshold (alpha)',
    },
  },
};

export const Basic = ({
  liftvaluePrecision,
  pvaluePrecision,
  significanceLevel,
  width,
  height,
}: {
  liftvaluePrecision: number;
  pvaluePrecision: number;
  significanceLevel: number;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="paired-t-test"
    width={width}
    height={height}
    queriesData={[{ data }]}
    formData={{
      groupby: ['name'],
      liftvalue_precision: liftvaluePrecision,
      metrics: ['sum__num'],
      pvalue_precision: pvaluePrecision,
      significance_level: significanceLevel,
    }}
  />
);
