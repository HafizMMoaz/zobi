import { ChartProps, getChartTransformPropsRegistry } from '@zobi-ui/core';
import {
  getChartConfigs,
  parseSelectedChart,
} from '../util/transformPropsUtil';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, hooks, theme } = chartProps;
  const {
    geomColumn,
    selectedChart: selectedChartString,
    chartSize,
    layerConfigs,
    mapView,
    chartBackgroundColor,
    chartBackgroundBorderRadius,
  } = formData;
  const { setControlValue = () => {} } = hooks;
  const selectedChart = parseSelectedChart(selectedChartString);
  const transformPropsRegistry = getChartTransformPropsRegistry();
  const chartTransformer = transformPropsRegistry.get(selectedChart.viz_type);

  const chartConfigs = getChartConfigs(
    selectedChart,
    geomColumn,
    chartProps,
    chartTransformer,
  );

  return {
    width,
    height,
    geomColumn,
    selectedChart,
    chartConfigs,
    chartVizType: selectedChart.viz_type,
    chartSize,
    layerConfigs,
    mapView,
    chartBackgroundColor,
    chartBackgroundBorderRadius,
    setControlValue,
    theme,
  };
}
