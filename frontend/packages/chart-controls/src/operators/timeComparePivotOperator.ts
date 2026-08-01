/* eslint-disable camelcase */

import {
  ensureIsArray,
  getColumnLabel,
  NumpyFunction,
  PostProcessingPivot,
  getXAxisLabel,
} from '@zobi.dev/core';
import { getMetricOffsetsMap, isTimeComparison } from './utils';
import { PostProcessingFactory } from './types';

export const timeComparePivotOperator: PostProcessingFactory<
  PostProcessingPivot
> = (formData, queryObject) => {
  const metricOffsetMap = getMetricOffsetsMap(formData, queryObject);
  const xAxisLabel = getXAxisLabel(formData);
  const columns = queryObject.series_columns || queryObject.columns;

  if (isTimeComparison(formData, queryObject) && xAxisLabel) {
    const aggregates = Object.fromEntries(
      [...metricOffsetMap.values(), ...metricOffsetMap.keys()].map(metric => [
        metric,
        // use the 'mean' aggregates to avoid drop NaN
        { operator: 'mean' as NumpyFunction },
      ]),
    );

    return {
      operation: 'pivot',
      options: {
        index: [xAxisLabel],
        columns: ensureIsArray(columns).map(getColumnLabel),
        drop_missing_columns: !formData?.show_empty_columns,
        aggregates,
      },
    };
  }

  return undefined;
};
