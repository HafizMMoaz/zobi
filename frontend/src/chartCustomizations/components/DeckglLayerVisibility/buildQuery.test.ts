import buildQuery from './buildQuery';
import { DeckglLayerVisibilityFormData } from './types';

test('returns empty query context', () => {
  const formData: DeckglLayerVisibilityFormData = {
    viz_type: 'deckgl_layer_visibility',
    defaultToAllLayersVisible: true,
    datasource: '1__table',
  };

  const result = buildQuery(formData);

  expect(result).toHaveProperty('queries');
  expect(result.queries).toEqual([]);
});

test('returns empty query context with defaultToAllLayersVisible false', () => {
  const formData: DeckglLayerVisibilityFormData = {
    viz_type: 'deckgl_layer_visibility',
    defaultToAllLayersVisible: false,
    datasource: '1__table',
  };

  const result = buildQuery(formData);

  expect(result).toHaveProperty('queries');
  expect(result.queries).toEqual([]);
});
