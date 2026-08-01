import { t } from '@zobi/core/translation';
import { AnnotationType, Behavior } from '@zobi-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import {
  EchartsMixedTimeseriesFormData,
  EchartsMixedTimeseriesProps,
} from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsTimeseriesChartPlugin extends EchartsChartPlugin<
  EchartsMixedTimeseriesFormData,
  EchartsMixedTimeseriesProps
> {
  /**
   * The constructor is used to pass relevant metadata and callbacks that get
   * registered in respective registries that are used throughout the library
   * and application. A more thorough description of each property is given in
   * the respective imported file.
   *
   * It is worth noting that `buildQuery` and is optional, and only needed for
   * advanced visualizations that require either post processing operations
   * (pivoting, rolling aggregations, sorting etc) or submitting multiple queries.
   */
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsMixedTimeseries'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Evolution'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Visualize two different series using the same x-axis. Note that both series can be visualized with a different chart type (e.g. 1 using bars and 1 using a line).',
        ),
        supportedAnnotationTypes: [
          AnnotationType.Event,
          AnnotationType.Formula,
          AnnotationType.Interval,
          AnnotationType.Timeseries,
        ],
        exampleGallery: [{ url: example, urlDark: exampleDark }],
        name: t('Mixed Chart'),
        thumbnail,
        thumbnailDark,
        tags: [
          t('Advanced-Analytics'),
          t('ECharts'),
          t('Line'),
          t('Multi-Variables'),
          t('Time'),
          t('Transformable'),
          t('Featured'),
        ],
        queryObjectCount: 2,
      },
      transformProps,
    });
  }
}
