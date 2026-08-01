import { SpatialFormData, buildSpatialQuery } from '../spatialUtils';

export interface DeckHexFormData extends SpatialFormData {
  extruded?: boolean;
  js_agg_function?: string;
  grid_size?: number;
}

export default function buildQuery(formData: DeckHexFormData) {
  return buildSpatialQuery(formData);
}
