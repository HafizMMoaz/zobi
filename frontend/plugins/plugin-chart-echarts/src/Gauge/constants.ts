import { ZobiTheme } from '@zobi/core/theme';
import type { GaugeSeriesOption } from 'echarts/charts';

export const defaultGaugeSeriesOption = (
  theme: ZobiTheme,
): GaugeSeriesOption => ({
  splitLine: {
    lineStyle: {
      color: theme.colorPrimary,
    },
  },
  axisLine: {
    lineStyle: {
      color: [[1, theme.colorSplit]],
    },
  },
  axisLabel: {
    color: theme.colorText,
  },
  axisTick: {
    lineStyle: {
      width: 2,
      color: theme.colorPrimary,
    },
  },
  detail: {
    color: theme.colorText,
  },
});

export const INTERVAL_GAUGE_SERIES_OPTION: GaugeSeriesOption = {
  splitLine: {
    lineStyle: {
      color: 'auto',
    },
  },
  axisTick: {
    lineStyle: {
      color: 'auto',
    },
  },
  axisLabel: {
    color: 'auto',
  },
  pointer: {
    itemStyle: {
      color: 'auto',
    },
  },
};

export const OFFSETS = {
  ticksFromLine: 10,
  titleFromCenter: 20,
};

export const FONT_SIZE_MULTIPLIERS = {
  axisTickLength: 0.25,
  axisLabelDistance: 1.5,
  axisLabelLength: 0.35,
  splitLineLength: 1,
  splitLineWidth: 0.25,
  titleOffsetFromTitle: 2,
  detailOffsetFromTitle: 0.9,
  detailFontSize: 1.2,
};
