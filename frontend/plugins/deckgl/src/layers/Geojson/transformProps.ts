import { ChartProps, getColumnLabel } from '@zobi.dev/core';
import { getRecordsFromQuery } from '../transformUtils';
import { DataRecord } from '../spatialUtils';
import { createBaseTransformResult } from '../transformUtils';

export default function transformProps(chartProps: ChartProps) {
  const { rawFormData: formData } = chartProps;
  const geojsonCol = formData.geojson
    ? getColumnLabel(formData.geojson)
    : undefined;

  if (!geojsonCol) {
    return createBaseTransformResult(chartProps, []);
  }

  const records = getRecordsFromQuery(chartProps.queriesData);
  const crossFilterCol = formData.cross_filter_column || undefined;

  // Parse each record's geojson column value (replicates backend DeckGeoJson.get_properties)
  const features = records
    .map((record: DataRecord) => {
      const geojsonStr = record[geojsonCol];
      if (geojsonStr == null) return null;
      try {
        const feature = JSON.parse(String(geojsonStr));
        // Surface cross_filter_column from the row onto feature.properties so
        // that picking can emit a dimension filter even when the GeoJSON blob
        // doesn't carry the column itself.
        if (crossFilterCol && record[crossFilterCol] !== undefined) {
          feature.properties = {
            ...feature.properties,
            [crossFilterCol]: record[crossFilterCol],
          };
        }
        return feature;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return createBaseTransformResult(chartProps, features);
}
