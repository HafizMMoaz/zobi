import { VizType } from '@zobi.dev/core';
import {
  EchartsBoxPlotChartPlugin,
  EchartsPieChartPlugin,
  EchartsTimeseriesChartPlugin,
  EchartsGraphChartPlugin,
  EchartsFunnelChartPlugin,
  EchartsTreemapChartPlugin,
  EchartsAreaChartPlugin,
  EchartsTimeseriesBarChartPlugin,
  EchartsTimeseriesLineChartPlugin,
  EchartsTimeseriesScatterChartPlugin,
  EchartsTimeseriesSmoothLineChartPlugin,
  EchartsTimeseriesStepChartPlugin,
  EchartsMixedTimeseriesChartPlugin,
  EchartsGaugeChartPlugin,
  EchartsRadarChartPlugin,
  EchartsTreeChartPlugin,
  BigNumberChartPlugin,
  BigNumberTotalChartPlugin,
  EchartsSunburstChartPlugin,
} from '../src';

import { EchartsChartPlugin } from '../src/types';

test('@zobi.dev/echarts exists', () => {
  expect(EchartsBoxPlotChartPlugin).toBeDefined();
  expect(EchartsPieChartPlugin).toBeDefined();
  expect(EchartsTimeseriesChartPlugin).toBeDefined();
  expect(EchartsGraphChartPlugin).toBeDefined();
  expect(EchartsFunnelChartPlugin).toBeDefined();
  expect(EchartsTreemapChartPlugin).toBeDefined();
  expect(EchartsAreaChartPlugin).toBeDefined();
  expect(EchartsTimeseriesBarChartPlugin).toBeDefined();
  expect(EchartsTimeseriesLineChartPlugin).toBeDefined();
  expect(EchartsTimeseriesScatterChartPlugin).toBeDefined();
  expect(EchartsTimeseriesSmoothLineChartPlugin).toBeDefined();
  expect(EchartsTimeseriesStepChartPlugin).toBeDefined();
  expect(EchartsMixedTimeseriesChartPlugin).toBeDefined();
  expect(EchartsGaugeChartPlugin).toBeDefined();
  expect(EchartsRadarChartPlugin).toBeDefined();
  expect(EchartsTreeChartPlugin).toBeDefined();
  expect(BigNumberChartPlugin).toBeDefined();
  expect(BigNumberTotalChartPlugin).toBeDefined();
  expect(EchartsSunburstChartPlugin).toBeDefined();
});

test('@zobi.dev/plugin-echarts-parsemethod-validation', () => {
  const plugins: EchartsChartPlugin[] = [
    new EchartsBoxPlotChartPlugin().configure({
      key: VizType.BoxPlot,
    }),
    new EchartsPieChartPlugin().configure({
      key: VizType.Pie,
    }),
    new EchartsTimeseriesChartPlugin().configure({
      key: VizType.Timeseries,
    }),
    new EchartsGraphChartPlugin().configure({
      key: VizType.Graph,
    }),
    new EchartsFunnelChartPlugin().configure({
      key: VizType.Funnel,
    }),
    new EchartsTreemapChartPlugin().configure({
      key: VizType.Treemap,
    }),
    new EchartsAreaChartPlugin().configure({
      key: VizType.Area,
    }),
    new EchartsTimeseriesBarChartPlugin().configure({
      key: VizType.Bar,
    }),
    new EchartsTimeseriesLineChartPlugin().configure({
      key: VizType.Line,
    }),
    new EchartsTimeseriesScatterChartPlugin().configure({
      key: VizType.Scatter,
    }),
    new EchartsTimeseriesSmoothLineChartPlugin().configure({
      key: VizType.SmoothLine,
    }),
    new EchartsTimeseriesStepChartPlugin().configure({
      key: VizType.Step,
    }),
    new EchartsMixedTimeseriesChartPlugin().configure({
      key: VizType.MixedTimeseries,
    }),
    new EchartsGaugeChartPlugin().configure({
      key: VizType.Gauge,
    }),
    new EchartsRadarChartPlugin().configure({
      key: VizType.Radar,
    }),
    new EchartsTreeChartPlugin().configure({
      key: 'tree',
    }),
    new BigNumberChartPlugin().configure({
      key: VizType.BigNumber,
    }),
    new BigNumberTotalChartPlugin().configure({
      key: VizType.BigNumberTotal,
    }),
    new EchartsSunburstChartPlugin().configure({
      key: 'sunburst',
    }),
  ];

  plugins.forEach(plugin => {
    expect(plugin.metadata.parseMethod).toEqual('json');
  });
});
