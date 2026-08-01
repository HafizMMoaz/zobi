import { extent as d3Extent, range as d3Range } from 'd3-array';
import { select as d3Select } from 'd3-selection';
import { getSequentialSchemeRegistry } from '@zobi.dev/core';
import { ZobiTheme } from '@zobi.dev/extension-api/theme';
import { t } from '@zobi.dev/extension-api/translation';
import CalHeatMapImport from './vendor/cal-heatmap';
import { convertUTCTimestampToLocal } from './utils';

// The vendor file is @ts-nocheck, so its export lacks type info.
// Define a minimal constructor interface for use in this file.
interface CalHeatMapInstance {
  init(config: Record<string, unknown>): void;
}
const CalHeatMap = CalHeatMapImport as unknown as new () => CalHeatMapInstance;

interface CalendarData {
  data: Record<string, Record<string, number>>;
  domain: string;
  range: number;
  start: number;
  subdomain: string;
}

interface CalendarProps {
  data: CalendarData;
  height: number;
  cellPadding?: number;
  cellRadius?: number;
  cellSize?: number;
  domainGranularity: string;
  linearColorScheme: string;
  showLegend: boolean;
  showMetricName: boolean;
  showValues: boolean;
  steps: number;
  subdomainGranularity: string;
  timeFormatter: (ts: number | string) => string;
  valueFormatter: (value: number) => string;
  verboseMap: Record<string, string>;
  theme: ZobiTheme;
}

function Calendar(element: HTMLElement, props: CalendarProps) {
  const {
    data,
    height,
    cellPadding = 3,
    cellRadius = 0,
    cellSize = 10,
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
    theme,
  } = props;

  const container = d3Select(element)
    .classed('zobi-legacy-chart-calendar', true)
    .style('height', height);
  container.selectAll('*').remove();
  const div = container.append('div');

  const subDomainTextFormat = showValues
    ? (_date: Date, value: number) => valueFormatter(value)
    : null;

  const metricsData = data.data;

  const METRIC_TEXT = t('Metric');

  Object.keys(metricsData).forEach(metric => {
    const calContainer = div.append('div');
    if (showMetricName) {
      calContainer.text(`${METRIC_TEXT}: ${verboseMap[metric] || metric}`);
    }
    const timestamps = metricsData[metric];
    const rawExtents = d3Extent(
      Object.keys(timestamps),
      key => timestamps[key],
    );
    // Guard against undefined extents (empty data)
    const extents: [number, number] =
      rawExtents[0] != null && rawExtents[1] != null
        ? [rawExtents[0], rawExtents[1]]
        : [0, 1];
    // Guard against division by zero when steps <= 1
    const step = steps > 1 ? (extents[1] - extents[0]) / (steps - 1) : 0;
    const colorScheme = getSequentialSchemeRegistry().get(linearColorScheme);
    const colorScale = colorScheme
      ? colorScheme.createLinearScale(extents)
      : (v: number) => '#ccc'; // fallback if scheme not found

    const legend = d3Range(steps).map(i => extents[0] + step * i);
    const legendColors = legend.map(x => colorScale(x));

    const cal = new CalHeatMap();
    cal.init({
      start: convertUTCTimestampToLocal(data.start),
      data: timestamps,
      itemSelector: calContainer.node(),
      legendVerticalPosition: 'top',
      cellSize,
      cellPadding,
      cellRadius,
      legendCellSize: cellSize,
      legendCellPadding: 2,
      legendCellRadius: cellRadius,
      tooltip: true,
      domain: domainGranularity,
      subDomain: subdomainGranularity,
      range: data.range,
      browsing: true,
      legend,
      legendColors: {
        colorScale,
        min: legendColors[0],
        max: legendColors[legendColors.length - 1],
        empty: theme.colorBgElevated,
      },
      displayLegend: showLegend,
      itemName: '',
      valueFormatter,
      timeFormatter,
      subDomainTextFormat,
    });
  });
}

Calendar.displayName = 'Calendar';

export default Calendar;
