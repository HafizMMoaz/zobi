
import {
  ensureIsArray,
  getColumnLabel,
  getMetricLabel,
  PostProcessingBoxplot,
  BoxPlotQueryObjectWhiskerType,
} from '@zobi.dev/core';
import { PostProcessingFactory } from './types';

const PERCENTILE_REGEX = /(\d+)\/(\d+) percentiles/;

export const boxplotOperator: PostProcessingFactory<PostProcessingBoxplot> = (
  formData,
  queryObject,
) => {
  const { groupby, whiskerOptions } = formData;

  if (whiskerOptions) {
    let whiskerType: BoxPlotQueryObjectWhiskerType;
    let percentiles: [number, number] | undefined;
    const percentileMatch = PERCENTILE_REGEX.exec(whiskerOptions as string);

    if (whiskerOptions === 'Tukey' || !whiskerOptions) {
      whiskerType = 'tukey';
    } else if (whiskerOptions === 'Min/max (no outliers)') {
      whiskerType = 'min/max';
    } else if (percentileMatch) {
      whiskerType = 'percentile';
      percentiles = [
        parseInt(percentileMatch[1], 10),
        parseInt(percentileMatch[2], 10),
      ];
    } else {
      throw new Error(`Unsupported whisker type: ${whiskerOptions}`);
    }

    return {
      operation: 'boxplot',
      options: {
        whisker_type: whiskerType,
        percentiles,
        groupby: ensureIsArray(groupby).map(getColumnLabel),
        metrics: ensureIsArray(queryObject.metrics).map(getMetricLabel),
      },
    };
  }
  return undefined;
};
