import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { ChartConfig } from '../../src/types';
import { fitMapToCharts } from '../../src/util/mapUtil';

describe('mapUtil', () => {
  describe('fitMapToCharts', () => {
    test('changes the center of the map', () => {
      const chartConfig: ChartConfig = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [8.793, 53.04117],
            },
            properties: {
              setDataMask: '',
              labelMap: '',
              labelMapB: '',
              groupby: '',
              selectedValues: '',
              formData: '',
              groupbyB: '',
              seriesBreakdown: '',
              legendData: '',
              echartOptions: '',
            },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [10.61833, 51.8],
            },
            properties: {
              setDataMask: '',
              labelMap: '',
              labelMapB: '',
              groupby: '',
              selectedValues: '',
              formData: '',
              groupbyB: '',
              seriesBreakdown: '',
              legendData: '',
              echartOptions: '',
            },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [6.86883, 50.35667],
            },
            properties: {
              setDataMask: '',
              labelMap: '',
              labelMapB: '',
              groupby: '',
              selectedValues: '',
              formData: '',
              groupbyB: '',
              seriesBreakdown: '',
              legendData: '',
              echartOptions: '',
            },
          },
        ],
      };

      const initialCenter = [0, 0];

      const olMap = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        target: 'map',
        view: new View({
          center: initialCenter,
          zoom: 2,
        }),
      });

      // should set center
      fitMapToCharts(olMap, chartConfig);

      const updatedCenter = olMap.getView().getCenter();

      expect(initialCenter).not.toEqual(updatedCenter);
    });
  });
});
