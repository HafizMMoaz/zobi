/* eslint-disable camelcase */

import { getMetricLabel, ensureIsArray } from '@zobi-ui/core';
import { PostProcessingFactory } from '../types';
import { TIME_COMPARISON_SEPARATOR } from './constants';

export const getMetricOffsetsMap: PostProcessingFactory<Map<string, string>> = (
  formData,
  queryObject,
) => {
  /*
    return metric offset-label and metric-label hashmap, for instance:
    {
      "SUM(value)__1 year ago": "SUM(value)",
      "SUM(value)__2 year ago": "SUM(value)"
    }
  */
  const queryMetrics = ensureIsArray(queryObject.metrics);
  const timeOffsets = ensureIsArray(formData.time_compare);

  const metricLabels = queryMetrics.map(getMetricLabel);
  const metricOffsetMap = new Map<string, string>();
  metricLabels.forEach((metric: string) => {
    timeOffsets.forEach((offset: string) => {
      metricOffsetMap.set(
        [metric, offset].join(TIME_COMPARISON_SEPARATOR),
        metric,
      );
    });
  });

  return metricOffsetMap;
};
