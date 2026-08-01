
import { ChartProps, getNumberFormatter } from '@zobi.dev/core';
import { getFormattedUTCTime } from './utils';

export default function transformProps(chartProps: ChartProps) {
  const { height, formData, queriesData, datasource } = chartProps;
  const {
    cellPadding,
    cellRadius,
    cellSize,
    domainGranularity,
    linearColorScheme,
    showLegend,
    showMetricName,
    showValues,
    steps,
    subdomainGranularity,
    xAxisTimeFormat,
    yAxisFormat,
  } = formData;

  const { verboseMap } = datasource;
  const timeFormatter = (ts: number | string) =>
    getFormattedUTCTime(ts, xAxisTimeFormat);
  const valueFormatter = getNumberFormatter(yAxisFormat);

  return {
    height,
    data: queriesData[0].data,
    cellPadding,
    cellRadius,
    cellSize,
    domainGranularity,
    linearColorScheme,
    showLegend,
    showMetricName,
    showValues,
    steps,
    subdomainGranularity,
    timeFormatter,
    valueFormatter,
    verboseMap,
  };
}
