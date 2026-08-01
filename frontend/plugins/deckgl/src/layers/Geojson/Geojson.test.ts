import { SqlaFormData } from '@zobi.dev/core';
import {
  computeGeoJsonTextOptionsFromJsOutput,
  computeGeoJsonTextOptionsFromFormData,
  computeGeoJsonIconOptionsFromJsOutput,
  computeGeoJsonIconOptionsFromFormData,
} from './Geojson';

jest.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  Map: () => null,
  useControl: () => null,
}));

test('computeGeoJsonTextOptionsFromJsOutput returns an empty object for non-object input', () => {
  expect(computeGeoJsonTextOptionsFromJsOutput(null)).toEqual({});
  expect(computeGeoJsonTextOptionsFromJsOutput(42)).toEqual({});
  expect(computeGeoJsonTextOptionsFromJsOutput([1, 2, 3])).toEqual({});
  expect(computeGeoJsonTextOptionsFromJsOutput('string')).toEqual({});
});

test('computeGeoJsonTextOptionsFromJsOutput extracts valid text options from the input object', () => {
  const input = {
    getText: 'name',
    getTextColor: [1, 2, 3, 255],
    invalidOption: true,
  };
  const expectedOutput = {
    getText: 'name',
    getTextColor: [1, 2, 3, 255],
  };
  expect(computeGeoJsonTextOptionsFromJsOutput(input)).toEqual(expectedOutput);
});

test('computeGeoJsonTextOptionsFromFormData computes text options based on form data', () => {
  const formData: SqlaFormData = {
    label_property_name: 'name',
    label_color: { r: 1, g: 2, b: 3, a: 1 },
    label_size: 123,
    label_size_unit: 'pixels',
    datasource: 'test_datasource',
    viz_type: 'deck_geojson',
  };

  const expectedOutput = {
    getText: expect.any(Function),
    getTextColor: [1, 2, 3, 255],
    getTextSize: 123,
    textSizeUnits: 'pixels',
  };

  const actualOutput = computeGeoJsonTextOptionsFromFormData(formData);
  expect(actualOutput).toEqual(expectedOutput);

  const sampleFeature = { properties: { name: 'Test' } };
  expect(actualOutput.getText(sampleFeature)).toBe('Test');
});

test('computeGeoJsonIconOptionsFromJsOutput returns an empty object for non-object input', () => {
  expect(computeGeoJsonIconOptionsFromJsOutput(null)).toEqual({});
  expect(computeGeoJsonIconOptionsFromJsOutput(42)).toEqual({});
  expect(computeGeoJsonIconOptionsFromJsOutput([1, 2, 3])).toEqual({});
  expect(computeGeoJsonIconOptionsFromJsOutput('string')).toEqual({});
});

test('computeGeoJsonIconOptionsFromJsOutput extracts valid icon options from the input object', () => {
  const input = {
    getIcon: 'icon_name',
    getIconColor: [1, 2, 3, 255],
    invalidOption: false,
  };

  const expectedOutput = {
    getIcon: 'icon_name',
    getIconColor: [1, 2, 3, 255],
  };

  expect(computeGeoJsonIconOptionsFromJsOutput(input)).toEqual(expectedOutput);
});

test('computeGeoJsonIconOptionsFromFormData computes icon options based on form data', () => {
  const formData: SqlaFormData = {
    icon_url: 'https://example.com/icon.png',
    icon_size: 123,
    icon_size_unit: 'pixels',
    datasource: 'test_datasource',
    viz_type: 'deck_geojson',
  };

  const expectedOutput = {
    getIcon: expect.any(Function),
    getIconSize: 123,
    iconSizeUnits: 'pixels',
  };

  const actualOutput = computeGeoJsonIconOptionsFromFormData(formData);
  expect(actualOutput).toEqual(expectedOutput);

  expect(actualOutput.getIcon()).toEqual({
    url: 'https://example.com/icon.png',
    height: 128,
    width: 128,
  });
});
