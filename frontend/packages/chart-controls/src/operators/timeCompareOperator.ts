/* eslint-disable camelcase */

import { ComparisonType, PostProcessingCompare } from '@zobi.dev/core';
import { getMetricOffsetsMap, isTimeComparison } from './utils';
import { PostProcessingFactory } from './types';

export const timeCompareOperator: PostProcessingFactory<
  PostProcessingCompare
> = (formData, queryObject) => {
  const comparisonType = formData.comparison_type;
  const metricOffsetMap = getMetricOffsetsMap(formData, queryObject);

  if (
    isTimeComparison(formData, queryObject) &&
    comparisonType !== ComparisonType.Values
  ) {
    return {
      operation: 'compare',
      options: {
        source_columns: Array.from(metricOffsetMap.values()),
        compare_columns: Array.from(metricOffsetMap.keys()),
        compare_type: comparisonType,
        drop_original_columns: true,
      },
    };
  }

  return undefined;
};
