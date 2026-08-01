/* eslint-disable camelcase */

import {
  ensureIsArray,
  JsonObject,
  QueryFormData,
  ComparisonType,
} from '@zobi.dev/core';
import { hasTimeOffset } from './timeOffset';

export const isDerivedSeries = (
  series: JsonObject,
  formData: QueryFormData,
  seriesName?: string,
): boolean => {
  const comparisonType = formData.comparison_type;
  if (comparisonType !== ComparisonType.Values) {
    return false;
  }
  const timeCompare: string[] = ensureIsArray(formData?.time_compare);
  // Check if series matches time offset patterns or exact match (single metric case)
  return (
    hasTimeOffset(series, timeCompare) ||
    (seriesName !== undefined && timeCompare.includes(seriesName))
  );
};
