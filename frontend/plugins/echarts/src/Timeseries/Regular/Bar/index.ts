import { t } from '@zobi.dev/extension-api/translation';
import { AnnotationType, Behavior } from '@zobi.dev/core';
import {
  EchartsTimeseriesChartProps,
  EchartsTimeseriesFormData,
  EchartsTimeseriesSeriesType,
} from '../../types';
import { EchartsChartPlugin } from '../../../types';
import buildQuery from '../../buildQuery';
import controlPanel from './controlPanel';
import transformProps from '../../transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/Bar1.png';
import example1Dark from './images/Bar1-dark.png';
import example2 from './images/Bar2.png';
import example2Dark from './images/Bar2-dark.png';
import example3 from './images/Bar3.png';
import example3Dark from './images/Bar3-dark.png';

const barTransformProps = (chartProps: EchartsTimeseriesChartProps) =>
  transformProps({
    ...chartProps,
    formData: {
      ...chartProps.formData,
      seriesType: EchartsTimeseriesSeriesType.Bar,
    },
  });

export default class EchartsTimeseriesBarChartPlugin extends EchartsChartPlugin<
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
          'Bar Charts are used to show metrics as a series of bars.',
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
          { url: example3, urlDark: example3Dark },
        ],
        supportedAnnotationTypes: [
          AnnotationType.Event,
          AnnotationType.Formula,
          AnnotationType.Interval,
          AnnotationType.Timeseries,
        ],
        name: t('Bar Chart'),
        tags: [
          t('ECharts'),
          t('Predictive'),
          t('Advanced-Analytics'),
          t('Time'),
          t('Transformable'),
          t('Stacked'),
          t('Bar'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps: barTransformProps,
    });
  }
}
