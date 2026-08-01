import { SpatialFormData, buildSpatialQuery } from '../spatialUtils';

export interface DeckContourFormData extends SpatialFormData {
  cellSize?: string;
  aggregation?: string;
  contours?: Array<{
    color: { r: number; g: number; b: number };
    lowerThreshold: number;
    upperThreshold?: number;
    strokeWidth?: number;
  }>;
}

export default function buildQuery(formData: DeckContourFormData) {
  return buildSpatialQuery(formData);
}
