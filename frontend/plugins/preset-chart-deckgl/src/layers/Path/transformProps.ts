import { ChartProps, DTTM_ALIAS } from '@zobi-ui/core';
import { addJsColumnsToExtraProps, DataRecord } from '../spatialUtils';
import {
  createBaseTransformResult,
  getRecordsFromQuery,
  getMetricLabelFromFormData,
  parseMetricValue,
  addPropertiesToFeature,
} from '../transformUtils';
import { DeckPathFormData } from './buildQuery';

declare global {
  interface Window {
    polyline?: {
      decode: (data: string) => [number, number][];
    };
    geohash?: {
      decode: (data: string) => { longitude: number; latitude: number };
    };
  }
}

export interface DeckPathTransformPropsFormData extends DeckPathFormData {
  js_data_mutator?: string;
  js_tooltip?: string;
  js_onclick_href?: string;
}

interface PathFeature {
  path: [number, number][];
  metric?: number;
  timestamp?: unknown;
  extraProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const decoders = {
  json: (data: string): [number, number][] => {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  },
  polyline: (data: string): [number, number][] => {
    try {
      if (typeof window !== 'undefined' && window.polyline) {
        return window.polyline.decode(data);
      }
      return [];
    } catch (error) {
      return [];
    }
  },
  geohash: (data: string): [number, number][] => {
    try {
      if (typeof window !== 'undefined' && window.geohash) {
        const decoded = window.geohash.decode(data);
        return [[decoded.longitude, decoded.latitude]];
      }
      return [];
    } catch (error) {
      return [];
    }
  },
};

function processPathData(
  records: DataRecord[],
  lineColumn: string,
  lineType: 'polyline' | 'json' | 'geohash' = 'json',
  reverseLongLat: boolean = false,
  metricLabel?: string,
  jsColumns?: string[],
): PathFeature[] {
  if (!records.length || !lineColumn) {
    return [];
  }

  const decoder = decoders[lineType] || decoders.json;
  const excludeKeys = new Set(
    [
      lineType !== 'geohash' ? lineColumn : undefined,
      'timestamp',
      DTTM_ALIAS,
      metricLabel,
      ...(jsColumns || []),
    ].filter(Boolean) as string[],
  );

  return records.map(record => {
    const lineData = record[lineColumn];
    let path: [number, number][] = [];

    if (lineData) {
      path = decoder(String(lineData));
      if (reverseLongLat && path.length > 0) {
        path = path.map(([lng, lat]) => [lat, lng]);
      }
    }

    let feature: PathFeature = {
      path,
      timestamp: record[DTTM_ALIAS],
      extraProps: {},
    };

    if (metricLabel && record[metricLabel] != null) {
      const metricValue = parseMetricValue(record[metricLabel]);
      if (metricValue !== undefined) {
        feature.metric = metricValue;
      }
    }

    feature = addJsColumnsToExtraProps(feature, record, jsColumns);
    feature = addPropertiesToFeature(feature, record, excludeKeys);
    return feature;
  });
}

export default function transformProps(chartProps: ChartProps) {
  const { rawFormData: formData } = chartProps;
  const {
    line_column,
    line_type = 'json',
    metric,
    reverse_long_lat = false,
    js_columns,
  } = formData as DeckPathTransformPropsFormData;

  const metricLabel = getMetricLabelFromFormData(metric);
  const records = getRecordsFromQuery(chartProps.queriesData);
  const features = processPathData(
    records,
    line_column || '',
    line_type,
    reverse_long_lat,
    metricLabel,
    js_columns,
  ).reverse();

  return createBaseTransformResult(
    chartProps,
    features,
    metricLabel ? [metricLabel] : [],
  );
}
