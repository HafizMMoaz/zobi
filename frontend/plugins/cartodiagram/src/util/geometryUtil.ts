/**
 * Util for geometry related operations.
 */

import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Point as OlPoint } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { Point as GeoJsonPoint } from 'geojson';

/**
 * Extracts the coordinate from a Point GeoJSON in the current map projection.
 *
 * @param geoJsonPoint The GeoJSON string for the point
 *
 * @returns The coordinate
 */
export const getProjectedCoordinateFromPointGeoJson = (
  geoJsonPoint: GeoJsonPoint,
) => {
  const geom: OlPoint = new GeoJSON().readGeometry(geoJsonPoint, {
    // TODO: adapt to map projection
    featureProjection: 'EPSG:3857',
  }) as OlPoint;
  return geom.getCoordinates();
};

/**
 * Computes the extent for an array of features.
 *
 * @param features An Array of OpenLayers features
 * @returns The OpenLayers extent or undefined
 */
export const getExtentFromFeatures = (features: Feature[]) => {
  if (features.length === 0) {
    return undefined;
  }
  const source = new VectorSource();
  source.addFeatures(features);
  return source.getExtent();
};
