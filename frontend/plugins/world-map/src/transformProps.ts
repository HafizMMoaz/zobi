import { rgb } from 'd3-color';
import { ChartProps, getValueFormatter } from '@zobi.dev/core';

export default function transformProps(chartProps: ChartProps) {
  const {
    width,
    height,
    formData,
    queriesData,
    hooks,
    inContextMenu,
    filterState,
    emitCrossFilters,
    datasource,
  } = chartProps;
  const { onContextMenu, setDataMask } = hooks;
  const {
    countryFieldtype,
    entity,
    maxBubbleSize,
    showBubbles,
    linearColorScheme,
    colorPicker,
    colorBy,
    colorScheme,
    sliceId,
    metric,
    yAxisFormat,
    currencyFormat,
  } = formData;
  const { r, g, b } = colorPicker;
  const {
    currencyFormats = {},
    columnFormats = {},
    currencyCodeColumn,
  } = datasource;
  const { data, detected_currency: detectedCurrency } = queriesData[0];

  const formatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    yAxisFormat,
    currencyFormat,
    undefined, // key - not needed for single-metric charts
    data,
    currencyCodeColumn,
    detectedCurrency,
  );

  return {
    countryFieldtype,
    entity,
    data,
    width,
    height,
    maxBubbleSize: parseInt(maxBubbleSize, 10),
    showBubbles,
    linearColorScheme,
    color: rgb(r, g, b).hex(),
    colorBy,
    colorScheme,
    sliceId,
    onContextMenu,
    setDataMask,
    inContextMenu,
    filterState,
    emitCrossFilters,
    formatter,
  };
}
