

/* eslint-disable sort-keys */
/* eslint-disable no-magic-numbers */
import { SuperChart } from '@zobi.dev/core';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { PathChartPlugin } from '@zobi.dev/deckgl';
import { withResizableChartDemo, dummyDatasource } from '@storybook-shared';
import payload from './payload';

new PathChartPlugin().configure({ key: 'deck_path' }).register();

export default {
  title: 'Chart Plugins/preset-chart-deckgl/PathChartPlugin',
  decorators: [withResizableChartDemo],
  args: {
    lineWidth: 150,
    autozoom: true,
  },
  argTypes: {
    lineWidth: {
      control: { type: 'range', min: 10, max: 500, step: 10 },
      description: 'Width of path lines in meters',
    },
    autozoom: { control: 'boolean' },
  },
};

export const PathChartViz = ({
  lineWidth,
  autozoom,
  width,
  height,
}: {
  lineWidth: number;
  autozoom: boolean;
  width: number;
  height: number;
}) => {
  const theme = useTheme();
  return (
    <SuperChart
      chartType="deck_path"
      width={width}
      height={height}
      datasource={dummyDatasource}
      queriesData={[payload(theme)]}
      formData={{
        datasource: '11__table',
        viz_type: 'deck_path',
        slice_id: 72,
        url_params: {},
        granularity_sqla: null,
        time_grain_sqla: null,
        time_range: '+:+',
        line_column: 'path_json',
        line_type: 'json',
        row_limit: 5000,
        filter_nulls: true,
        adhoc_filters: [],
        map_style:
          'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        viewport: {
          altitude: 1.5,
          bearing: 0,
          height: 1094,
          latitude: 37.73671752604488,
          longitude: -122.18885402582598,
          maxLatitude: 85.05113,
          maxPitch: 60,
          maxZoom: 20,
          minLatitude: -85.05113,
          minPitch: 0,
          minZoom: 0,
          pitch: 0,
          width: 669,
          zoom: 9.51847667620428,
        },
        color_picker: { a: 1, b: 135, g: 122, r: 0 },
        line_width: lineWidth,
        reverse_long_lat: false,
        autozoom,
        js_columns: ['color'],
        js_data_mutator: '',
        js_tooltip: '',
        js_onclick_href: '',
      }}
    />
  );
};
