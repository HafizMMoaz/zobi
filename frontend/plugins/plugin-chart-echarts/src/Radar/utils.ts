/*
 function for finding the max metric values among all series data for Radar Chart
*/
export const findGlobalMax = (
  data: Record<string, unknown>[],
  metrics: string[],
): number => {
  if (!data?.length || !metrics?.length) return 0;

  return data.reduce((globalMax, row) => {
    const rowMax = metrics.reduce((max, metric) => {
      const value = row[metric];
      return typeof value === 'number' &&
        Number.isFinite(value) &&
        !Number.isNaN(value)
        ? Math.max(max, value)
        : max;
    }, 0);

    return Math.max(globalMax, rowMax);
  }, 0);
};

interface TooltipParams {
  color: string;
  name?: string;
  value: number[];
}

interface TooltipMetricValue {
  metric: string;
  value: number;
}

export const renderNormalizedTooltip = (
  params: TooltipParams,
  metrics: string[],
  getDenormalizedValue: (seriesName: string, value: string) => number,
  metricsWithCustomBounds: Set<string>,
): string => {
  const { color, name = '', value: values } = params;
  const seriesName = name || 'series0';

  const colorDot = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:5px;height:5px;background-color:${color}"></span>`;

  // Get metric values with denormalization if needed
  const metricValues: TooltipMetricValue[] = metrics.map((metric, index) => {
    const value = values[index];
    const originalValue = metricsWithCustomBounds.has(metric)
      ? value
      : getDenormalizedValue(name, String(value));

    return {
      metric,
      value: originalValue,
    };
  });

  const tooltipRows = metricValues
    .map(
      ({ metric, value }) => `
        <div style="display:flex;">
          <div>${colorDot}${metric}:</div>
          <div style="font-weight:bold;margin-left:auto;">${value}</div>
        </div>
      `,
    )
    .join('');

  return `
    <div style="font-weight:bold;margin-bottom:5px;">${seriesName}</div>
    ${tooltipRows}
  `;
};
