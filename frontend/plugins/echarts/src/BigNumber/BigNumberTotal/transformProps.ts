import {
  ColorFormatters,
  getColorFormatters,
  Metric,
} from '@zobi.dev/chart-controls';
import {
  getMetricLabel,
  extractTimegrain,
  QueryFormData,
  getValueFormatter,
} from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { BigNumberTotalChartProps, BigNumberVizProps } from '../types';
import { PROPORTION } from '../constants';
import { getDateFormatter, getOriginalLabel, parseMetricValue } from '../utils';
import { Refs } from '../../types';

export default function transformProps(
  chartProps: BigNumberTotalChartProps,
): BigNumberVizProps {
  const {
    width,
    height,
    queriesData,
    formData,
    rawFormData,
    hooks,
    datasource: {
      currencyFormats = {},
      columnFormats = {},
      currencyCodeColumn,
    },
    theme,
  } = chartProps;
  const {
    metricNameFontSize,
    headerFontSize,
    metric = 'value',
    subtitle,
    subtitleFontSize,
    forceTimestampFormatting,
    timeFormat,
    yAxisFormat,
    conditionalFormatting,
    currencyFormat,
    subheader,
    subheaderFontSize,
  } = formData;
  const refs: Refs = {};
  const {
    data = [],
    coltypes = [],
    detected_currency: detectedCurrency,
  } = queriesData[0] || {};
  const granularity = extractTimegrain(rawFormData as QueryFormData);
  const metrics = chartProps.datasource?.metrics || [];
  const originalLabel = getOriginalLabel(metric, metrics);
  const metricName = getMetricLabel(metric);
  const showMetricName = chartProps.rawFormData?.show_metric_name ?? false;
  const formattedSubtitle = subtitle?.trim() ? subtitle : subheader || '';
  const formattedSubtitleFontSize = subtitle?.trim()
    ? (subtitleFontSize ?? PROPORTION.SUBHEADER)
    : (subheaderFontSize ?? subtitleFontSize ?? PROPORTION.SUBHEADER);
  const bigNumber =
    data.length === 0 ? null : parseMetricValue(data[0][metricName]);

  let metricEntry: Metric | undefined;
  if (chartProps.datasource?.metrics) {
    metricEntry = chartProps.datasource.metrics.find(
      metricItem => metricItem.metric_name === metric,
    );
  }

  const formatTime = getDateFormatter(
    timeFormat,
    granularity,
    metricEntry?.d3format,
  );

  const numberFormatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    metricEntry?.d3format || yAxisFormat,
    currencyFormat,
    undefined,
    data,
    currencyCodeColumn,
    detectedCurrency,
  );

  const headerFormatter =
    coltypes[0] === GenericDataType.Temporal ||
    coltypes[0] === GenericDataType.String ||
    forceTimestampFormatting
      ? formatTime
      : numberFormatter;

  const { onContextMenu } = hooks;

  const defaultColorFormatters = [] as ColorFormatters;

  const colorThresholdFormatters =
    getColorFormatters(conditionalFormatting, data, theme, false) ??
    defaultColorFormatters;
  return {
    width,
    height,
    bigNumber,
    headerFormatter,
    headerFontSize,
    subheaderFontSize,
    subtitleFontSize: formattedSubtitleFontSize,
    subtitle: formattedSubtitle,
    onContextMenu,
    refs,
    colorThresholdFormatters,
    metricName: originalLabel,
    showMetricName,
    metricNameFontSize,
  };
}
