

import {
  SuperChart,
  getChartTransformPropsRegistry,
  VizType,
} from '@zobi-ui/core';
import {
  EchartsAreaChartPlugin,
  TimeseriesTransformProps,
} from '@zobi-ui/plugin-chart-echarts';
import data from './data';
import { withResizableChartDemo } from '@storybook-shared';

new EchartsAreaChartPlugin().configure({ key: VizType.Area }).register();

getChartTransformPropsRegistry().registerValue(
  VizType.Area,
  TimeseriesTransformProps,
);

export default {
  title: 'Chart Plugins/plugin-chart-echarts',
  decorators: [withResizableChartDemo],
  component: SuperChart,
  parameters: {
    initialSize: { width: 500, height: 300 },
  },
  args: {
    forecastEnabled: true,
    seriesType: 'line',
    show_extra_controls: false,
    logAxis: false,
    stack: false,
    showValue: false,
    onlyTotal: false,
    percentageThreshold: 0,
    markerEnabled: false,
    markerSize: 6,
    minorSplitLine: false,
    opacity: 0.2,
    zoomable: false,
  },
  argTypes: {
    forecastEnabled: {
      control: 'boolean',
      description: 'Extra Forecast',
      defaultValue: false,
    },
    seriesType: {
      control: 'select',
      description: 'Line type',
      options: ['line', 'scatter', 'smooth', 'bar', 'start', 'middle', 'end'],
    },
    show_extra_controls: {
      control: 'boolean',
      description: 'Extra Controls',
      defaultValue: false,
    },
    logAxis: {
      control: 'boolean',
      description: 'Log axis',
      defaultValue: false,
    },
    stack: {
      control: 'boolean',
      defaultValue: false,
    },
    showValue: {
      control: 'boolean',
      description: 'Show Values',
      defaultValue: false,
    },
    onlyTotal: {
      control: 'boolean',
      description: 'Only Total',
      defaultValue: false,
    },
    percentageThreshold: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Percentage Threshold',
      defaultValue: 0,
    },
    markerEnabled: {
      control: 'boolean',
      description: 'Enable markers',
      defaultValue: false,
    },
    markerSize: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Marker Size',
      defaultValue: 6,
    },
    minorSplitLine: {
      control: 'boolean',
      description: 'Minor splitline',
      defaultValue: false,
    },
    opacity: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 },
      description: 'Opacity',
      defaultValue: 0.2,
    },
    zoomable: {
      control: 'boolean',
      description: 'Zoomable',
      defaultValue: false,
    },
  },
};

export const AreaSeries = ({
  forecastEnabled,
  seriesType,
  show_extra_controls,
  logAxis,
  stack,
  showValue,
  onlyTotal,
  percentageThreshold,
  markerEnabled,
  markerSize,
  minorSplitLine,
  opacity,
  zoomable,
  width,
  height,
}: {
  forecastEnabled: boolean;
  seriesType: string;
  show_extra_controls: boolean;
  logAxis: boolean;
  stack: boolean;
  showValue: boolean;
  onlyTotal: boolean;
  percentageThreshold: number;
  markerEnabled: boolean;
  markerSize: number;
  minorSplitLine: boolean;
  opacity: number;
  zoomable: boolean;
  width: number;
  height: number;
}) => {
  const queryData = data
    .map(row =>
      forecastEnabled
        ? row
        : {
            // eslint-disable-next-line no-underscore-dangle
            __timestamp: row.__timestamp,
            Boston: row.Boston,
            California: row.California,
            WestTexNewMexico: row.WestTexNewMexico,
          },
    )
    .filter(row => forecastEnabled || !!row.Boston);
  return (
    <SuperChart
      chartType={VizType.Area}
      width={width}
      height={height}
      queriesData={[{ data: queryData }]}
      formData={{
        area: true,
        contributionMode: undefined,
        forecastEnabled,
        colorScheme: 'zobiColors',
        seriesType,
        show_extra_controls,
        logAxis,
        yAxisFormat: 'SMART_NUMBER',
        stack,
        showValue,
        onlyTotal,
        percentageThreshold,
        markerEnabled,
        markerSize,
        minorSplitLine,
        opacity,
        zoomable,
      }}
    />
  );
};
