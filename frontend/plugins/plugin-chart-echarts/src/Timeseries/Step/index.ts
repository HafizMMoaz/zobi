import { t } from '@zobi/core/translation';
import { AnnotationType, Behavior } from '@zobi-ui/core';
import { EchartsTimeseriesChartProps, EchartsTimeseriesFormData } from '../..';
import buildQuery from '../buildQuery';
import controlPanel from './controlPanel';
import transformProps from '../transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/Step1.png';
import example1Dark from './images/Step1-dark.png';
import example2 from './images/Step2.png';
import example2Dark from './images/Step2-dark.png';
import { EchartsChartPlugin } from '../../types';

export default class EchartsTimeseriesStepChartPlugin extends EchartsChartPlugin<
  EchartsTimeseriesFormData,
  EchartsTimeseriesChartProps
> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../EchartsTimeseries'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Evolution'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Stepped-line graph (also called step chart) is a variation of line chart but with the line forming a series of steps between data points. A step chart can be useful when you want to show the changes that occur at irregular intervals.',
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
        supportedAnnotationTypes: [
          AnnotationType.Event,
          AnnotationType.Formula,
          AnnotationType.Interval,
          AnnotationType.Timeseries,
        ],
        name: t('Stepped Line'),
        tags: [
          t('ECharts'),
          t('Predictive'),
          t('Advanced-Analytics'),
          t('Time'),
          t('Transformable'),
          t('Stacked'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
