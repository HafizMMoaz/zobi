import { ChartProps } from '@zobi-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { formData, queriesData } = chartProps;
  const {
    groupby,
    liftvaluePrecision,
    metrics,
    pvaluePrecision,
    significanceLevel,
  } = formData;

  return {
    alpha: significanceLevel,
    data: queriesData[0].data,
    groups: groupby,
    liftValPrec: parseInt(liftvaluePrecision, 10),
    metrics: (metrics as (string | { label: string })[]).map(
      (metric: string | { label: string }) =>
        typeof metric === 'string' ? metric : metric.label,
    ),
    pValPrec: parseInt(pvaluePrecision, 10),
  };
}
