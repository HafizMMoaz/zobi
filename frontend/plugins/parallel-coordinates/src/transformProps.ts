import { ChartProps } from '@zobi.dev/core';
import { isThemeDark } from '@zobi.dev/extension-api/theme';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, queriesData, theme } = chartProps;
  const {
    includeSeries,
    linearColorScheme,
    metrics,
    secondaryMetric,
    series,
    showDatatable,
  } = formData;

  return {
    width,
    height,
    data: queriesData[0].data,
    defaultLineColor: theme.colorTextTertiary,
    includeSeries,
    isDarkMode: isThemeDark(theme),
    linearColorScheme,
    metrics: metrics.map((m: { label?: string } | string) =>
      typeof m === 'string' ? m : m.label || m,
    ),
    colorMetric: secondaryMetric?.label || secondaryMetric,
    series,
    showDatatable,
  };
}
