import {
  DEFAULT_SORT_SERIES_DATA,
  sections,
} from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';
import { LegendOrientation, LegendType } from '../types';
import {
  OrientationType,
  EchartsTimeseriesSeriesType,
  EchartsTimeseriesFormData,
} from './types';
// import {
//   DEFAULT_LEGEND_FORM_DATA,
//   DEFAULT_TITLE_FORM_DATA,
// } from '../constants';
import { defaultXAxis } from '../defaults';

// @ts-expect-error
export const DEFAULT_FORM_DATA: EchartsTimeseriesFormData = {
  // ...DEFAULT_LEGEND_FORM_DATA, // TODO: figure out why these break things for stories (e.g. Bubble Chart)
  // Here are the contents of DEFAULT_LEGEND_FORM_DATA:
  legendMargin: null,
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  showLegend: true,
  // ...DEFAULT_TITLE_FORM_DATA, // TODO: figure out why these break things for stories (e.g. Bubble Chart)
  // here are the contents of DEFAULT_TITLE_FORM_DATA:
  xAxisTitle: '',
  xAxisTitleMargin: 40,
  yAxisTitle: '',
  yAxisTitleMargin: 50,
  yAxisTitlePosition: 'Top',
  // Now that the weird bug workaround is over, here's the rest...
  ...DEFAULT_SORT_SERIES_DATA,
  annotationLayers: sections.annotationLayers,
  area: false,
  forecastEnabled: sections.FORECAST_DEFAULT_DATA.forecastEnabled,
  forecastInterval: sections.FORECAST_DEFAULT_DATA.forecastInterval,
  forecastPeriods: sections.FORECAST_DEFAULT_DATA.forecastPeriods,
  forecastSeasonalityDaily:
    sections.FORECAST_DEFAULT_DATA.forecastSeasonalityDaily,
  forecastSeasonalityWeekly:
    sections.FORECAST_DEFAULT_DATA.forecastSeasonalityWeekly,
  forecastSeasonalityYearly:
    sections.FORECAST_DEFAULT_DATA.forecastSeasonalityYearly,
  logAxis: false,
  markerEnabled: false,
  markerSize: 6,
  minorSplitLine: false,
  opacity: 0.2,
  orderDesc: true,
  rowLimit: 10000,
  seriesType: EchartsTimeseriesSeriesType.Line,
  stack: false,
  tooltipTimeFormat: 'smart_date',
  xAxisTimeFormat: 'smart_date',
  xAxisNumberFormat: 'SMART_NUMBER',
  truncateXAxis: true,
  truncateYAxis: false,
  yAxisBounds: [null, null],
  zoomable: false,
  richTooltip: true,
  xAxisForceCategorical: false,
  xAxisLabelRotation: defaultXAxis.xAxisLabelRotation,
  xAxisLabelInterval: defaultXAxis.xAxisLabelInterval,
  groupby: [],
  showValue: false,
  onlyTotal: false,
  percentageThreshold: 0,
  orientation: OrientationType.Vertical,
  sort_series_type: 'sum',
  sort_series_ascending: false,
};

export const TIME_SERIES_DESCRIPTION_TEXT: string = t(
  'When using other than adaptive formatting, labels may overlap',
);
