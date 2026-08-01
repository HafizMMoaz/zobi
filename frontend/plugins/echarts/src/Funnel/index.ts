import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import { EchartsFunnelChartProps, EchartsFunnelFormData } from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsFunnelChartPlugin extends EchartsChartPlugin<
  EchartsFunnelFormData,
  EchartsFunnelChartProps
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
      loadChart: () => import('./EchartsFunnel'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('KPI'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Showcases how a metric changes as the funnel progresses. This classic chart is useful for visualizing drop-off between stages in a pipeline or lifecycle.',
        ),
        exampleGallery: [{ url: example, urlDark: exampleDark }],
        name: t('Funnel Chart'),
        tags: [
          t('Business'),
          t('ECharts'),
          t('Progressive'),
          t('Report'),
          t('Sequential'),
          t('Trend'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
