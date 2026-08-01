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
import example1 from './images/Scatter1.png';
import example1Dark from './images/Scatter1-dark.png';
import { EchartsChartPlugin } from '../../../types';

const scatterTransformProps = (chartProps: EchartsTimeseriesChartProps) =>
  transformProps({
    ...chartProps,
    formData: {
      ...chartProps.formData,
      seriesType: EchartsTimeseriesSeriesType.Scatter,
    },
  });

export default class EchartsTimeseriesScatterChartPlugin extends EchartsChartPlugin<
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
          'Scatter Plot has the horizontal axis in linear units, and the points are connected in order. It shows a statistical relationship between two variables.',
        ),
        exampleGallery: [{ url: example1, urlDark: example1Dark }],
        supportedAnnotationTypes: [
          AnnotationType.Event,
          AnnotationType.Formula,
          AnnotationType.Interval,
          AnnotationType.Timeseries,
        ],
        name: t('Scatter Plot'),
        tags: [
          t('ECharts'),
          t('Predictive'),
          t('Advanced-Analytics'),
          t('Time'),
          t('Transformable'),
          t('Scatter'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps: scatterTransformProps,
    });
  }
}
