
import { isEmpty } from 'lodash';
import {
  ensureIsArray,
  getMetricLabel,
  getXAxisLabel,
  isDefined,
  PostProcessingSort,
} from '@zobi.dev/core';
import { PostProcessingFactory } from './types';
import { extractExtraMetrics } from './utils';

export const sortOperator: PostProcessingFactory<
  PostProcessingSort
> = formData => {
  // the sortOperator only used in the barchart v2
  const sortableLabels = [
    getXAxisLabel(formData),
    ...ensureIsArray(formData.metrics).map(getMetricLabel),
    ...extractExtraMetrics(formData).map(getMetricLabel),
  ].filter(Boolean);

  if (
    isDefined(formData?.x_axis_sort) &&
    isDefined(formData?.x_axis_sort_asc) &&
    sortableLabels.includes(formData.x_axis_sort) &&
    // the sort operator doesn't support sort-by multiple series.
    isEmpty(formData.groupby)
  ) {
    if (formData.x_axis_sort === getXAxisLabel(formData)) {
      return {
        operation: 'sort',
        options: {
          is_sort_index: true,
          ascending: formData.x_axis_sort_asc,
        },
      };
    }

    return {
      operation: 'sort',
      options: {
        by: formData.x_axis_sort,
        ascending: formData.x_axis_sort_asc,
      },
    };
  }
  return undefined;
};
