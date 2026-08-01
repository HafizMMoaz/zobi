import { t } from '@zobi.dev/extension-api/translation';
import { AnnotationType, Behavior } from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './Regular/Line/controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import {
  EchartsTimeseriesChartProps,
  EchartsTimeseriesFormData,
} from './types';
import example from './images/Time-series_Chart.jpg';
import exampleDark from './images/Time-series_Chart-dark.jpg';
import { EchartsChartPlugin } from '../types';

export default class EchartsTimeseriesChartPlugin extends EchartsChartPlugin<
  EchartsTimeseriesFormData,
  EchartsTimeseriesChartProps
> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsTimeseries'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Evolution'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Swiss army knife for visualizing data. Choose between step, line, scatter, and bar charts. This viz type has many customization options as well.',
        ),
        exampleGallery: [{ url: example, urlDark: exampleDark }],
        supportedAnnotationTypes: [
          AnnotationType.Event,
          AnnotationType.Formula,
          AnnotationType.Interval,
          AnnotationType.Timeseries,
        ],
        name: t('Generic Chart'),
        tags: [
          t('Advanced-Analytics'),
          t('ECharts'),
          t('Line'),
          t('Predictive'),
          t('Time'),
          t('Transformable'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
