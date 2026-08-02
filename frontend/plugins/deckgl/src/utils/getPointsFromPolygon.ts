import { JsonObject } from '@zobi.dev/core';
import { Point } from '../types';

/** Format originally used by the Polygon plugin */
type CustomPolygonFeature = {
  polygon: Point[];
};

/**
 * Format that is geojson standard
 * https://geojson.org/geojson-spec.html
 */
type GeojsonPolygonFeature = {
  polygon: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: Point[][];
    };
  };
};

type PolygonFeature = CustomPolygonFeature | GeojsonPolygonFeature;

/**
 * Query results reach the layers as untyped records, so the parameter is
 * widened to `JsonObject` and narrowed to the two supported shapes here.
 */
export default function getPointsFromPolygon(feature: JsonObject): Point[] {
  const { polygon } = feature as PolygonFeature;

  return 'geometry' in polygon ? polygon.geometry.coordinates[0] : polygon;
}
