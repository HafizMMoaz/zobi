
import { PostProcessingHistogram, getColumnLabel } from '@zobi.dev/core';
import { PostProcessingFactory } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const histogramOperator: PostProcessingFactory<
  PostProcessingHistogram
> = (formData, queryObject) => {
  const { bins, column, cumulative, groupby = [], normalize } = formData;
  const parsedBins = Number.isNaN(Number(bins)) ? 5 : Number(bins);
  const parsedColumn = getColumnLabel(column);
  const parsedGroupBy = groupby!.map(getColumnLabel);
  return {
    operation: 'histogram',
    options: {
      column: parsedColumn,
      groupby: parsedGroupBy,
      bins: parsedBins,
      cumulative,
      normalize,
    },
  };
};
