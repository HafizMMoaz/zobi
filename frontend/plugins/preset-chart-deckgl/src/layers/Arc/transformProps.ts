import { ChartProps } from '@zobi-ui/core';
import {
  processSpatialData,
  addJsColumnsToExtraProps,
  DataRecord,
} from '../spatialUtils';
import {
  createBaseTransformResult,
  getRecordsFromQuery,
  addPropertiesToFeature,
} from '../transformUtils';
import { DeckArcFormData } from './buildQuery';

interface ArcPoint {
  sourcePosition: [number, number];
  targetPosition: [number, number];
  cat_color?: string;
  __timestamp?: number;
  extraProps?: Record<string, unknown>;
  [key: string]: unknown;
}

function processArcData(
  records: DataRecord[],
  startSpatial: DeckArcFormData['start_spatial'],
  endSpatial: DeckArcFormData['end_spatial'],
  dimension?: string,
  jsColumns?: string[],
): ArcPoint[] {
  if (!startSpatial || !endSpatial || !records.length) {
    return [];
  }

  const startFeatures = processSpatialData(records, startSpatial);
  const endFeatures = processSpatialData(records, endSpatial);
  const excludeKeys = new Set(
    ['__timestamp', dimension, ...(jsColumns || [])].filter(
      (key): key is string => key != null,
    ),
  );

  return records
    .map((record, index) => {
      const startFeature = startFeatures[index];
      const endFeature = endFeatures[index];

      if (!startFeature || !endFeature) {
        return null;
      }

      let arcPoint: ArcPoint = {
        sourcePosition: startFeature.position,
        targetPosition: endFeature.position,
        extraProps: {},
      };

      arcPoint = addJsColumnsToExtraProps(arcPoint, record, jsColumns);

      if (dimension && record[dimension] != null) {
        arcPoint.cat_color = String(record[dimension]);
      }

      // eslint-disable-next-line no-underscore-dangle
      if (record.__timestamp != null) {
        // eslint-disable-next-line no-underscore-dangle
        arcPoint.__timestamp = Number(record.__timestamp);
      }

      arcPoint = addPropertiesToFeature(arcPoint, record, excludeKeys);
      return arcPoint;
    })
    .filter((point): point is ArcPoint => point !== null);
}

export default function transformProps(chartProps: ChartProps) {
  const { rawFormData: formData } = chartProps;
  const { start_spatial, end_spatial, dimension, js_columns } =
    formData as DeckArcFormData;

  const records = getRecordsFromQuery(chartProps.queriesData);
  const features = processArcData(
    records,
    start_spatial,
    end_spatial,
    dimension,
    js_columns,
  );

  return createBaseTransformResult(chartProps, features);
}
