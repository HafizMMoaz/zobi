
import { ChartConfig } from '../../src/types';
import { isChartConfigEqual, simplifyConfig } from '../../src/util/chartUtil';

describe('chartUtil', () => {
  const configA: ChartConfig = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        },
        properties: {
          refs: 'foo',
        },
      },
    ],
  };

  const configB: ChartConfig = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        },
        properties: {
          refs: 'foo',
          foo: 'bar',
        },
      },
    ],
  };

  describe('simplifyConfig', () => {
    test('removes the refs property from a feature', () => {
      const simplifiedConfig = simplifyConfig(configA);
      const propKeys = Object.keys(simplifiedConfig.features[0].properties);

      expect(propKeys).toHaveLength(0);
    });
  });

  describe('isChartConfigEqual', () => {
    test('returns true, if configurations are equal', () => {
      const isEqual = isChartConfigEqual(configA, structuredClone(configA));
      expect(isEqual).toBe(true);
    });

    test('returns false if configurations are not equal', () => {
      const isEqual = isChartConfigEqual(configA, configB);
      expect(isEqual).toBe(false);
    });
  });
});
