import { t } from '@zobi.dev/extension-api/translation';
import { AnnotationType, Behavior } from '@zobi.dev/core';
import {
  EchartsTimeseriesChartProps,
  EchartsTimeseriesFormData,
  EchartsTimeseriesSeriesType,
} from '../../types';
import buildQuery from '../../buildQuery';
import controlPanel from './controlPanel';
import transformProps from '../../transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/SmoothLine1.png';
import example1Dark from './images/SmoothLine1-dark.png';
import { EchartsChartPlugin } from '../../../types';

const smoothTransformProps = (chartProps: EchartsTimeseriesChartProps) =>
  transformProps({
    ...chartProps,
    formData: {
      ...chartProps.formData,
      seriesType: EchartsTimeseriesSeriesType.Smooth,
    },
  });

export default class EchartsTimeseriesSmoothLineChartPlugin extends EchartsChartPlugin<
  EchartsTimeseriesFormData,
  EchartsTimeseriesChartProps
> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../../EchartsTimeseries'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Evolution'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Smooth-line is a variation of the line chart. Without angles and hard edges, Smooth-line sometimes looks smarter and more professional.',
        ),
        exampleGallery: [{ url: example1, urlDark: example1Dark }],
        supportedAnnotationTypes: [
          AnnotationType.Event,
          AnnotationType.Formula,
          AnnotationType.Interval,
          AnnotationType.Timeseries,
        ],
        name: t('Smooth Line'),
        tags: [
          t('ECharts'),
          t('Predictive'),
          t('Advanced-Analytics'),
          t('Time'),
          t('Line'),
          t('Transformable'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps: smoothTransformProps,
    });
  }
}
