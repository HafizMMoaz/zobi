
import { t } from '@zobi/core/translation';
import { Behavior } from '@zobi-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/example1.jpg';
import example1Dark from './images/example1-dark.jpg';
import example2 from './images/example2.jpg';
import example2Dark from './images/example2-dark.jpg';
import { EchartsRadarChartProps, EchartsRadarFormData } from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsRadarChartPlugin extends EchartsChartPlugin<
  EchartsRadarFormData,
  EchartsRadarChartProps
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
      loadChart: () => import('./EchartsRadar'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Ranking'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Visualize a parallel set of metrics across multiple groups. Each group is visualized using its own line of points and each metric is represented as an edge in the chart.',
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
        name: t('Radar Chart'),
        tags: [
          t('Business'),
          t('Comparison'),
          t('Multi-Variables'),
          t('Report'),
          t('Web'),
          t('ECharts'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
