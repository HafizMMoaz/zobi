/* eslint-disable sort-keys */
/* eslint-disable no-magic-numbers */
import { SuperChart } from '@zobi.dev/core';
import { HexChartPlugin } from '@zobi.dev/deckgl';
import { withResizableChartDemo, dummyDatasource } from '@storybook-shared';
import payload from './payload';

new HexChartPlugin().configure({ key: 'deck_hex' }).register();

export default {
  title: 'Chart Plugins/preset-chart-deckgl/HexChartPlugin',
  decorators: [withResizableChartDemo],
  args: {
    gridSize: 40,
    extruded: true,
    autozoom: true,
  },
  argTypes: {
    gridSize: {
      control: { type: 'range', min: 10, max: 200, step: 10 },
      description: 'Size of hexagon cells in meters',
    },
    extruded: {
      control: 'boolean',
      description: 'Extrude hexagons in 3D',
    },
    autozoom: { control: 'boolean' },
  },
};

export const HexChartViz = ({
  gridSize,
  extruded,
  autozoom,
  width,
  height,
}: {
  gridSize: number;
  extruded: boolean;
  autozoom: boolean;
  width: number;
  height: number;
}) => (
  <SuperChart
    chartType="deck_hex"
    width={width}
    height={height}
    datasource={dummyDatasource}
    queriesData={[payload]}
    formData={{
      datasource: '5__table',
      viz_type: 'deck_hex',
      slice_id: 68,
      url_params: {},
      granularity_sqla: 'dttm',
      time_grain_sqla: null,
      time_range: '+:+',
      spatial: { latCol: 'LAT', lonCol: 'LON', type: 'latlong' },
      size: 'count',
      row_limit: 5000,
      filter_nulls: true,
      adhoc_filters: [],
      map_style:
        'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      viewport: {
        bearing: -2.3984797349335167,
        latitude: 37.789795085160335,
        longitude: -122.40632230075536,
        pitch: 54.08961642447763,
        zoom: 13.835465702403654,
      },
      color_picker: { a: 1, b: 0, g: 255, r: 14 },
      autozoom,
      grid_size: gridSize,
      extruded,
      js_agg_function: 'sum',
      js_columns: [],
      js_data_mutator: '',
      js_tooltip: '',
      js_onclick_href: '',
    }}
  />
);
