import { ChartProps, getValueFormatter } from '@zobi.dev/core';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, queriesData, datasource } = chartProps;
  const {
    linearColorScheme,
    numberFormat,
    currencyFormat,
    selectCountry,
    colorScheme,
    sliceId,
    metric,
  } = formData;

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
    numberFormat,
    currencyFormat,
    undefined, // key - not needed for single-metric charts
    data,
    currencyCodeColumn,
    detectedCurrency,
  );

  return {
    width,
    height,
    data: queriesData[0].data,
    country: selectCountry ? String(selectCountry).toLowerCase() : null,
    linearColorScheme,
    numberFormat, // left for backward compatibility
    colorScheme,
    sliceId,
    formatter,
  };
}
