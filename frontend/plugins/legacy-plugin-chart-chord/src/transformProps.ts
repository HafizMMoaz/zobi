import { ChartProps } from '@zobi-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, queriesData } = chartProps;
  const { yAxisFormat, colorScheme, sliceId } = formData;

  return {
    colorScheme,
    data: queriesData[0].data,
    height,
    numberFormat: yAxisFormat,
    width,
    sliceId,
  };
}
