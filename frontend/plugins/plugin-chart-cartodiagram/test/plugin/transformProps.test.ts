import { ChartProps, getChartTransformPropsRegistry } from '@zobi-ui/core';
import { zobiTheme } from '@zobi/core/theme';
import { LayerConf, MapViewConfigs, ZoomConfigs } from '../../src/types';
import transformProps from '../../src/plugin/transformProps';
import {
  groupedTimeseriesChartData,
  groupedTimeseriesLabelMap,
} from '../testData';

describe('CartodiagramPlugin transformProps', () => {
  const chartSize: ZoomConfigs = {
    type: 'FIXED',
    configs: {
      height: 10,
      width: 10,
      zoom: 1,
    },
    values: {
      1: {
        height: 10,
        width: 10,
      },
    },
  };
  const layerConfigs: LayerConf[] = [
    {
      type: 'XYZ',
      title: 'foo',
      url: 'example.com',
    },
  ];
  const mapView: MapViewConfigs = {
    mode: 'FIT_DATA',
    zoom: 1,
    latitude: 0,
    longitude: 0,
    fixedZoom: 1,
    fixedLatitude: 0,
    fixedLongitude: 0,
  };

  // only minimal subset of actual params
  const selectedChartParams = {
    groupby: ['bar'],
    x_axis: 'mydate',
  };

  const selectedChart = {
    id: 1,
    viz_type: 'pie',
    slice_name: 'foo',
    params: JSON.stringify(selectedChartParams),
  };

  const formData = {
    viz_type: 'cartodiagram',
    geomColumn: 'geom',
    selectedChart: JSON.stringify(selectedChart),
    chartSize,
    layerConfigs,
    mapView,
    chartBackgroundColor: '#000000',
    chartBackgroundBorderRadius: 5,
  };

  const chartProps = new ChartProps({
    formData,
    width: 800,
    height: 600,
    queriesData: [
      {
        data: groupedTimeseriesChartData,
        label_map: groupedTimeseriesLabelMap,
      },
    ],
    theme: zobiTheme,
  });

  let chartTransformPropsPieMock: jest.MockedFunction<any>;
  let chartTransformPropsTimeseriesMock: jest.MockedFunction<any>;
  beforeEach(() => {
    chartTransformPropsPieMock = jest.fn();
    chartTransformPropsTimeseriesMock = jest.fn();
    const registry = getChartTransformPropsRegistry();
    registry.registerValue('pie', chartTransformPropsPieMock);
    registry.registerValue(
      'echarts_timeseries',
      chartTransformPropsTimeseriesMock,
    );
  });

  afterEach(() => {
    // remove registered transformProps
    const registry = getChartTransformPropsRegistry();
    registry.clear();
  });

  test('should call the transform props function of the referenced chart', () => {
    transformProps(chartProps);
    expect(chartTransformPropsPieMock).toHaveBeenCalled();
    expect(chartTransformPropsTimeseriesMock).not.toHaveBeenCalled();
  });

  test('should transform chart props for viz', () => {
    const transformedProps = transformProps(chartProps);
    expect(transformedProps).toEqual(
      expect.objectContaining({
        width: chartProps.width,
        height: chartProps.height,
        geomColumn: formData.geomColumn,
        selectedChart: expect.objectContaining({
          viz_type: selectedChart.viz_type,
          params: selectedChartParams,
        }),
        // The actual test for the created chartConfigs
        // will be done in transformPropsUtil.test.ts
        chartConfigs: expect.objectContaining({
          type: 'FeatureCollection',
        }),
        chartVizType: selectedChart.viz_type,
        chartSize,
        layerConfigs,
        mapView,
        chartBackgroundColor: formData.chartBackgroundColor,
        chartBackgroundBorderRadius: formData.chartBackgroundBorderRadius,
      }),
    );
  });
});
