import { ChartProps } from '@zobi.dev/core';
import transformProps from './transformProps';
import { DeckglLayerVisibilityFormData } from './types';

test('transforms props correctly with all required fields', () => {
  const setDataMaskMock = jest.fn();
  const formData: DeckglLayerVisibilityFormData = {
    viz_type: 'deckgl_layer_visibility',
    defaultToAllLayersVisible: true,
    datasource: '1__table',
  };

  const chartProps = {
    formData,
    height: 400,
    width: 600,
    filterState: { value: [1, 2] },
    hooks: { setDataMask: setDataMaskMock },
    ownState: { availableLayers: [] },
  } as unknown as ChartProps;

  const result = transformProps(chartProps);

  expect(result).toEqual({
    formData,
    height: 400,
    width: 600,
    filterState: { value: [1, 2] },
    setDataMask: setDataMaskMock,
    ownState: { availableLayers: [] },
  });
});

test('transforms props with empty filter state', () => {
  const setDataMaskMock = jest.fn();
  const formData: DeckglLayerVisibilityFormData = {
    viz_type: 'deckgl_layer_visibility',
    defaultToAllLayersVisible: false,
    datasource: '1__table',
  };

  const chartProps = {
    formData,
    height: 300,
    width: 500,
    filterState: {},
    hooks: { setDataMask: setDataMaskMock },
    ownState: undefined,
  } as unknown as ChartProps;

  const result = transformProps(chartProps);

  expect(result).toEqual({
    formData,
    height: 300,
    width: 500,
    filterState: {},
    setDataMask: setDataMaskMock,
    ownState: undefined,
  });
});

test('preserves setDataMask function reference', () => {
  const setDataMaskMock = jest.fn();
  const formData: DeckglLayerVisibilityFormData = {
    viz_type: 'deckgl_layer_visibility',
    defaultToAllLayersVisible: true,
    datasource: '1__table',
  };

  const chartProps = {
    formData,
    height: 200,
    width: 400,
    filterState: {},
    hooks: { setDataMask: setDataMaskMock },
  } as unknown as ChartProps;

  const result = transformProps(chartProps);

  expect(result.setDataMask).toBe(setDataMaskMock);
});
