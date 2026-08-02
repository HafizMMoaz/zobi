import { ChartProps, getColumnLabel } from '@zobi.dev/core';
import { WordCloudProps, WordCloudEncoding } from '../chart/WordCloud';
import { WordCloudFormData } from '../types';

function getMetricLabel(
  metric: WordCloudFormData['metric'],
): string | undefined {
  if (typeof metric === 'string' || typeof metric === 'undefined') {
    return metric;
  }
  if (Array.isArray(metric)) {
    return metric.length > 0 ? getMetricLabel(metric[0]) : undefined;
  }

  return metric.label;
}

export default function transformProps(chartProps: ChartProps): WordCloudProps {
  const { width, height, formData, queriesData } = chartProps;
  const {
    colorScheme,
    metric,
    rotation,
    series,
    sizeFrom = 0,
    sizeTo,
    sliceId,
  } = formData as WordCloudFormData;

  const metricLabel = getMetricLabel(metric);
  const seriesLabel = getColumnLabel(series);

  const encoding: Partial<WordCloudEncoding> = {
    color: {
      field: seriesLabel,
      scale: {
        scheme: colorScheme,
      },
      type: 'nominal',
    },
    fontSize:
      typeof metricLabel === 'undefined'
        ? undefined
        : {
            field: metricLabel,
            scale: {
              range: [sizeFrom, sizeTo],
              zero: true,
            },
            type: 'quantitative',
          },
    text: {
      field: seriesLabel,
    },
  };

  return {
    data: queriesData[0].data,
    encoding,
    height,
    rotation,
    width,
    sliceId,
    colorScheme,
  };
}
