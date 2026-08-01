import {
  isFeatureEnabled,
  FeatureFlag,
  Preset,
  VizType,
} from '@zobi.dev/core';
import CalendarChartPlugin from '@zobi.dev/calendar';
import ChordChartPlugin from '@zobi.dev/chord';
import CountryMapChartPlugin from '@zobi.dev/country-map';
import HorizonChartPlugin from '@zobi.dev/horizon';
import PairedTTestChartPlugin from '@zobi.dev/paired-t-test';
import ParallelCoordinatesChartPlugin from '@zobi.dev/parallel-coordinates';
import PartitionChartPlugin from '@zobi.dev/partition';
import RoseChartPlugin from '@zobi.dev/rose';
import TableChartPlugin from '@zobi.dev/table';
import { WordCloudChartPlugin } from '@zobi.dev/word-cloud';
import WorldMapChartPlugin from '@zobi.dev/world-map';
import {
  BubbleChartPlugin,
  BulletChartPlugin,
  CompareChartPlugin,
  TimePivotChartPlugin,
} from '@zobi.dev/nvd3';
import { DeckGLChartPreset } from '@zobi.dev/deckgl';
import ScatterMapChartPlugin from '@zobi.dev/point-cluster-map';
import { CartodiagramPlugin } from '@zobi.dev/cartodiagram';
import {
  BigNumberChartPlugin,
  BigNumberTotalChartPlugin,
  EchartsPieChartPlugin,
  EchartsBoxPlotChartPlugin,
  EchartsAreaChartPlugin,
  EchartsTimeseriesChartPlugin,
  EchartsTimeseriesBarChartPlugin,
  EchartsTimeseriesLineChartPlugin,
  EchartsTimeseriesScatterChartPlugin,
  EchartsTimeseriesSmoothLineChartPlugin,
  EchartsTimeseriesStepChartPlugin,
  EchartsGraphChartPlugin,
  EchartsGaugeChartPlugin,
  EchartsHistogramChartPlugin,
  EchartsRadarChartPlugin,
  EchartsFunnelChartPlugin,
  EchartsSankeyChartPlugin,
  EchartsTreemapChartPlugin,
  EchartsMixedTimeseriesChartPlugin,
  EchartsTreeChartPlugin,
  EchartsSunburstChartPlugin,
  EchartsBubbleChartPlugin,
  EchartsWaterfallChartPlugin,
  BigNumberPeriodOverPeriodChartPlugin,
  EchartsHeatmapChartPlugin,
  EchartsGanttChartPlugin,
} from '@zobi.dev/echarts';
import {
  SelectFilterPlugin,
  RangeFilterPlugin,
  TimeFilterPlugin,
  TimeColumnFilterPlugin,
  TimeGrainFilterPlugin,
} from 'src/filters/components';
import {
  ChartCustomizationTimeGrainPlugin,
  ChartCustomizationDynamicGroupBy,
  ChartCustomizationTimeColumnPlugin,
  DeckglLayerVisibilityCustomizationPlugin,
} from 'src/chartCustomizations/components';
import { PivotTableChartPlugin as PivotTableChartPluginV2 } from '@zobi.dev/pivot-table';
import { HandlebarsChartPlugin } from '@zobi.dev/handlebars';
import { ChartCustomizationPlugins, FilterPlugins } from 'src/constants';
import AgGridTableChartPlugin from '@zobi.dev/ag-grid-table';
import TimeTableChartPlugin from '../TimeTable';

export default class MainPreset extends Preset {
  constructor() {
    const experimentalPlugins = isFeatureEnabled(
      FeatureFlag.ChartPluginsExperimental,
    )
      ? [
          new BigNumberPeriodOverPeriodChartPlugin().configure({
            key: VizType.BigNumberPeriodOverPeriod,
          }),
        ]
      : [];

    const agGridTablePlugin = isFeatureEnabled(FeatureFlag.AgGridTableEnabled)
      ? [new AgGridTableChartPlugin().configure({ key: VizType.TableAgGrid })]
      : [];

    super({
      name: 'Legacy charts',
      presets: [new DeckGLChartPreset()],
      plugins: [
        new BigNumberChartPlugin().configure({ key: VizType.BigNumber }),
        new BigNumberTotalChartPlugin().configure({
          key: VizType.BigNumberTotal,
        }),
        new EchartsBoxPlotChartPlugin().configure({ key: VizType.BoxPlot }),
        new BubbleChartPlugin().configure({ key: VizType.LegacyBubble }),
        new BulletChartPlugin().configure({ key: VizType.Bullet }),
        new CalendarChartPlugin().configure({ key: VizType.Calendar }),
        new ChordChartPlugin().configure({ key: VizType.Chord }),
        new CompareChartPlugin().configure({ key: VizType.Compare }),
        new CountryMapChartPlugin().configure({ key: VizType.CountryMap }),
        new EchartsFunnelChartPlugin().configure({ key: VizType.Funnel }),
        new EchartsSankeyChartPlugin().configure({ key: VizType.Sankey }),
        new EchartsTreemapChartPlugin().configure({ key: VizType.Treemap }),
        new EchartsGanttChartPlugin().configure({ key: VizType.Gantt }),
        new EchartsGaugeChartPlugin().configure({ key: VizType.Gauge }),
        new EchartsGraphChartPlugin().configure({ key: VizType.Graph }),
        new EchartsRadarChartPlugin().configure({ key: VizType.Radar }),
        new EchartsMixedTimeseriesChartPlugin().configure({
          key: VizType.MixedTimeseries,
        }),
        new HorizonChartPlugin().configure({ key: VizType.Horizon }),
        new ScatterMapChartPlugin().configure({ key: VizType.PointClusterMap }),
        new PairedTTestChartPlugin().configure({ key: VizType.PairedTTest }),
        new ParallelCoordinatesChartPlugin().configure({
          key: VizType.ParallelCoordinates,
        }),
        new PartitionChartPlugin().configure({ key: VizType.Partition }),
        new EchartsPieChartPlugin().configure({ key: VizType.Pie }),
        new PivotTableChartPluginV2().configure({ key: VizType.PivotTable }),
        new RoseChartPlugin().configure({ key: VizType.Rose }),
        new TableChartPlugin().configure({ key: VizType.Table }),
        new TimePivotChartPlugin().configure({ key: VizType.TimePivot }),
        new TimeTableChartPlugin().configure({ key: VizType.TimeTable }),
        new WordCloudChartPlugin().configure({ key: VizType.WordCloud }),
        new WorldMapChartPlugin().configure({ key: VizType.WorldMap }),
        new EchartsAreaChartPlugin().configure({
          key: VizType.Area,
        }),
        new EchartsTimeseriesChartPlugin().configure({
          key: VizType.Timeseries,
        }),
        new EchartsTimeseriesBarChartPlugin().configure({
          key: VizType.Bar,
        }),
        new EchartsTimeseriesLineChartPlugin().configure({
          key: VizType.Line,
        }),
        new EchartsTimeseriesSmoothLineChartPlugin().configure({
          key: VizType.SmoothLine,
        }),
        new EchartsTimeseriesScatterChartPlugin().configure({
          key: VizType.Scatter,
        }),
        new EchartsTimeseriesStepChartPlugin().configure({
          key: VizType.Step,
        }),
        new EchartsWaterfallChartPlugin().configure({
          key: VizType.Waterfall,
        }),
        new EchartsHeatmapChartPlugin().configure({ key: VizType.Heatmap }),
        new EchartsHistogramChartPlugin().configure({ key: VizType.Histogram }),
        new SelectFilterPlugin().configure({ key: FilterPlugins.Select }),
        new RangeFilterPlugin().configure({ key: FilterPlugins.Range }),
        new TimeFilterPlugin().configure({ key: FilterPlugins.Time }),
        new TimeColumnFilterPlugin().configure({
          key: FilterPlugins.TimeColumn,
        }),
        new TimeGrainFilterPlugin().configure({
          key: FilterPlugins.TimeGrain,
        }),
        new ChartCustomizationTimeGrainPlugin().configure({
          key: ChartCustomizationPlugins.TimeGrain,
        }),
        new ChartCustomizationTimeColumnPlugin().configure({
          key: ChartCustomizationPlugins.TimeColumn,
        }),
        new ChartCustomizationDynamicGroupBy().configure({
          key: ChartCustomizationPlugins.DynamicGroupBy,
        }),
        new DeckglLayerVisibilityCustomizationPlugin().configure({
          key: ChartCustomizationPlugins.DeckglLayerVisibility,
        }),
        new EchartsTreeChartPlugin().configure({ key: VizType.Tree }),
        new EchartsSunburstChartPlugin().configure({ key: VizType.Sunburst }),
        new HandlebarsChartPlugin().configure({ key: VizType.Handlebars }),
        new EchartsBubbleChartPlugin().configure({ key: VizType.Bubble }),
        new CartodiagramPlugin({
          defaultLayers: [
            {
              type: 'WMS',
              version: '1.3.0',
              url: 'https://ows.terrestris.de/osm-gray/service',
              layersParam: 'OSM-WMS',
              title: 'OpenStreetMap',
              attribution:
                '© Map data from <a href="openstreetmap.org/copyright">OpenStreetMap</a>. Service provided by <a href="https://www.terrestris.de">terrestris GmbH & Co. KG</a>',
            },
          ],
        }).configure({ key: VizType.Cartodiagram }),
        ...experimentalPlugins,
        ...agGridTablePlugin,
      ],
    });
  }
}
