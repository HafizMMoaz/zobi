import {
  headerFontSize,
  subheaderFontSize,
  metricNameFontSize,
} from '../sharedControls';

const headerFontSizes = [16, 20, 30, 48, 60];
const sharedFontSizes = [16, 20, 26, 32, 40];

const metricNameProportionValues =
  metricNameFontSize.config.options.map(
    (option: { label: string; value: number }) => option.value,
  ) ?? [];

const headerProportionValues =
  headerFontSize.config.options.map(
    (option: { label: string; value: number }) => option.value,
  ) ?? [];

const subheaderProportionValues =
  subheaderFontSize.config.options.map(
    (option: { label: string; value: number }) => option.value,
  ) ?? [];

const getFontSizeMapping = (
  proportionValues: number[],
  actualSizes: number[],
) =>
  proportionValues.reduce<Record<number, number>>((acc, value, index) => {
    acc[value] = actualSizes[index] ?? actualSizes[actualSizes.length - 1];
    return acc;
  }, {});

const metricNameFontSizesMapping = getFontSizeMapping(
  metricNameProportionValues,
  sharedFontSizes,
);
const headerFontSizesMapping = getFontSizeMapping(
  headerProportionValues,
  headerFontSizes,
);

const comparisonFontSizesMapping = getFontSizeMapping(
  subheaderProportionValues,
  sharedFontSizes,
);

export const getMetricNameFontSize = (proportionValue: number) =>
  metricNameFontSizesMapping[proportionValue] ??
  sharedFontSizes[sharedFontSizes.length - 1];

export const getHeaderFontSize = (proportionValue: number) =>
  headerFontSizesMapping[proportionValue] ??
  headerFontSizes[headerFontSizes.length - 1];

export const getComparisonFontSize = (proportionValue: number) =>
  comparisonFontSizesMapping[proportionValue] ??
  sharedFontSizes[sharedFontSizes.length - 1];
