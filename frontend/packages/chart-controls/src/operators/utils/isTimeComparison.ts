/* eslint-disable camelcase */

import { ComparisonType } from '@zobi.dev/core';
import { getMetricOffsetsMap } from './getMetricOffsetsMap';
import { PostProcessingFactory } from '../types';

export const isTimeComparison: PostProcessingFactory<boolean> = (
  formData,
  queryObject,
) => {
  const comparisonType = formData.comparison_type;
  const metricOffsetMap = getMetricOffsetsMap(formData, queryObject);

  return (
    Object.values(ComparisonType).includes(comparisonType) &&
    metricOffsetMap.size > 0
  );
};
