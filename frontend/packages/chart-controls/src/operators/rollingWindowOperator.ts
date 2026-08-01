/* eslint-disable camelcase */

import {
  ensureIsArray,
  ensureIsInt,
  PostProcessingCum,
  PostProcessingRolling,
  RollingType,
} from '@zobi.dev/core';
import { getMetricOffsetsMap, isTimeComparison } from './utils';
import { PostProcessingFactory } from './types';

export const rollingWindowOperator: PostProcessingFactory<
  PostProcessingRolling | PostProcessingCum
> = (formData, queryObject) => {
  let columns: (string | undefined)[];
  if (isTimeComparison(formData, queryObject)) {
    const metricsMap = getMetricOffsetsMap(formData, queryObject);
    columns = [
      ...Array.from(metricsMap.values()),
      ...Array.from(metricsMap.keys()),
    ];
  } else {
    columns = ensureIsArray(queryObject.metrics).map(metric => {
      if (typeof metric === 'string') {
        return metric;
      }
      return metric.label;
    });
  }
  const columnsMap = Object.fromEntries(columns.map(col => [col, col]));

  if (formData.rolling_type === RollingType.Cumsum) {
    return {
      operation: 'cum',
      options: {
        operator: 'sum',
        columns: columnsMap,
      },
    };
  }

  if (
    [RollingType.Sum, RollingType.Mean, RollingType.Std].includes(
      formData.rolling_type,
    )
  ) {
    return {
      operation: 'rolling',
      options: {
        rolling_type: formData.rolling_type,
        window: ensureIsInt(formData.rolling_periods, 1),
        min_periods: ensureIsInt(formData.min_periods, 0),
        columns: columnsMap,
      },
    };
  }

  return undefined;
};
