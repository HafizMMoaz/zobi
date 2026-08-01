

import {
  SuperChart,
  VizType,
  getChartTransformPropsRegistry,
} from '@zobi.dev/core';
import { CartodiagramPlugin } from '@zobi.dev/cartodiagram';
import {
  EchartsPieChartPlugin,
  PieTransformProps,
} from '@zobi.dev/echarts';
import { withResizableChartDemo, dummyDatasource } from '@storybook-shared';
import {
  defaultLayerConfigs,
  defaultMapView,
  defaultChartBackgroundColor,
} from './data';

const VIZ_TYPE = 'cartodiagram';

// Register the pie chart plugin and its transformProps (same as Pie stories)
new EchartsPieChartPlugin().configure({ key: VizType.Pie }).register();
getChartTransformPropsRegistry().registerValue(VizType.Pie, PieTransformProps);

// Register the cartodiagram plugin
new CartodiagramPlugin({}).configure({ key: VIZ_TYPE }).register();

// Sample data: each row has a geom column + the same format as pie chart data
// The cartodiagram will group by geom location and create a pie for each
const SF_GEOM = '{"type":"Point","coordinates":[-122.4194,37.7749]}';
const LA_GEOM = '{"type":"Point","coordinates":[-118.2437,34.0522]}';

const sampleData = [
  // San Francisco data
  { geom: SF_GEOM, category: 'Tech', 'SUM(revenue)': 1500000 },
  { geom: SF_GEOM, category: 'Finance', 'SUM(revenue)': 800000 },
  { geom: SF_GEOM, category: 'Healthcare', 'SUM(revenue)': 400000 },
  // Los Angeles data
  { geom: LA_GEOM, category: 'Entertainment', 'SUM(revenue)': 3500000 },
  { geom: LA_GEOM, category: 'Tech', 'SUM(revenue)': 2000000 },
  { geom: LA_GEOM, category: 'Finance', 'SUM(revenue)': 1500000 },
];

export default {
  title: 'Chart Plugins/plugin-chart-cartodiagram',
  decorators: [withResizableChartDemo],
  args: {
    donut: false,
    showLabels: false,
    colorScheme: 'zobiColors',
    chartWidth: 100,
    chartHeight: 100,
    borderRadius: 8,
  },
  argTypes: {
    donut: {
      control: 'boolean',
      description: 'Display pie charts as donuts',
    },
    showLabels: {
      control: 'boolean',
      description: 'Show labels on embedded charts',
    },
    colorScheme: {
      control: 'select',
      options: [
        'zobiColors',
        'd3Category10',
        'bnbColors',
        'googleCategory20c',
      ],
    },
    chartWidth: {
      control: { type: 'range', min: 50, max: 200, step: 10 },
      description: 'Width of embedded charts in pixels',
    },
    chartHeight: {
      control: { type: 'range', min: 50, max: 200, step: 10 },
      description: 'Height of embedded charts in pixels',
    },
    borderRadius: {
      control: { type: 'range', min: 0, max: 50, step: 2 },
      description: 'Border radius of chart containers',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The Cartodiagram plugin displays embedded charts on a map using OpenLayers.
Each GeoJSON point location gets a small chart (pie, bar, etc.) rendered on it.

### Features
- OpenLayers map with configurable base layers (OSM, WMS, WFS, XYZ)
- Embedded Zobi charts at GeoJSON point locations
- Configurable chart size per zoom level
- Chart background color and border radius customization

### How It Works
1. Data includes a geometry column with GeoJSON Point strings
2. The plugin groups data by location
3. For each location, it calls the embedded chart's transformProps
4. Mini charts are rendered as OpenLayers overlays
        `,
      },
    },
  },
};

export const BasicMap = ({
  width,
  height,
  donut,
  showLabels,
  colorScheme,
  chartWidth,
  chartHeight,
  borderRadius,
}: {
  width: number;
  height: number;
  donut: boolean;
  showLabels: boolean;
  colorScheme: string;
  chartWidth: number;
  chartHeight: number;
  borderRadius: number;
}) => (
  <SuperChart
    chartType={VIZ_TYPE}
    width={width}
    height={height}
    datasource={dummyDatasource}
    queriesData={[
      {
        data: sampleData,
        colnames: ['geom', 'category', 'SUM(revenue)'],
        coltypes: [1, 1, 0],
      },
    ]}
    formData={{
      datasource: '1__table',
      viz_type: VIZ_TYPE,
      geom_column: 'geom',
      selected_chart: JSON.stringify({
        viz_type: VizType.Pie,
        params: JSON.stringify({
          groupby: ['category'],
          metric: 'SUM(revenue)',
          colorScheme,
          numberFormat: 'SMART_NUMBER',
          showLabels,
          showLegend: false,
          donut,
          outerRadius: 70,
        }),
      }),
      chart_size: {
        type: 'FIXED',
        configs: { zoom: 6, width: chartWidth, height: chartHeight },
        values: {
          6: { width: chartWidth, height: chartHeight },
          7: { width: chartWidth + 20, height: chartHeight + 20 },
          8: { width: chartWidth + 40, height: chartHeight + 40 },
        },
      },
      layer_configs: defaultLayerConfigs,
      map_view: defaultMapView,
      chart_background_color: defaultChartBackgroundColor,
      chart_background_border_radius: borderRadius,
    }}
  />
);

BasicMap.parameters = {
  initialSize: {
    width: 800,
    height: 600,
  },
  docs: {
    description: {
      story: `
Shows an OpenLayers map with embedded pie charts at San Francisco and Los Angeles.
Each pie chart shows the breakdown of revenue by industry sector for that city.

The map uses OpenStreetMap tiles as the base layer.
      `,
    },
  },
};
