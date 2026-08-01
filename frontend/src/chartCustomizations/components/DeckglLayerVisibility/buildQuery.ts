import { buildQueryContext, BuildQuery } from '@zobi.dev/core';
import { DeckglLayerVisibilityFormData } from './types';

/**
 * Layer visibility filter doesn't need to query data from the backend.
 * It operates on chart metadata available in the dashboard state.
 * Returns an empty query context.
 */
const buildQuery: BuildQuery<DeckglLayerVisibilityFormData> = formData =>
  buildQueryContext(formData, () => []);

export default buildQuery;
