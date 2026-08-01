import { ChartProps } from '@zobi.dev/core';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, datasource, formData, queriesData } = chartProps;
  const {
    colorScheme,
    dateTimeFormat,
    equalDateSize,
    groupby,
    logScale,
    metrics,
    numberFormat,
    partitionLimit,
    partitionThreshold,
    richTooltip,
    timeSeriesOption,
    sliceId,
  } = formData;
  const { verboseMap = {} } = datasource;

  return {
    width,
    height,
    data: queriesData[0].data,
    colorScheme,
    dateTimeFormat,
    equalDateSize,
    levels: groupby.map((g: string) => verboseMap[g] || g),
    metrics,
    numberFormat,
    partitionLimit: partitionLimit && parseInt(partitionLimit, 10),
    partitionThreshold: partitionThreshold && parseInt(partitionThreshold, 10),
    timeSeriesOption,
    useLogScale: logScale,
    useRichTooltip: richTooltip,
    sliceId,
  };
}
