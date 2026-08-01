import { SpatialFormData, buildSpatialQuery } from '../spatialUtils';

export interface DeckGridFormData extends SpatialFormData {
  extruded?: boolean;
}

export default function buildQuery(formData: DeckGridFormData) {
  return buildSpatialQuery(formData);
}
