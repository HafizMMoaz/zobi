import { ChartProps } from '@zobi-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, queriesData } = chartProps;
  const {
    colorScheme,
    dateTimeFormat,
    numberFormat,
    richTooltip,
    roseAreaProportion,
    sliceId,
  } = formData;

  return {
    width,
    height,
    data: queriesData[0].data,
    colorScheme,
    dateTimeFormat,
    numberFormat,
    useAreaProportions: roseAreaProportion,
    useRichTooltip: richTooltip,
    sliceId,
  };
}
