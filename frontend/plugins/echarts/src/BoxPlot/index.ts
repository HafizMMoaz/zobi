import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import example from './images/BoxPlot.jpg';
import exampleDark from './images/BoxPlot-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import { BoxPlotQueryFormData, EchartsBoxPlotChartProps } from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsBoxPlotChartPlugin extends EchartsChartPlugin<
  BoxPlotQueryFormData,
  EchartsBoxPlotChartProps
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
      loadChart: () => import('./EchartsBoxPlot'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Distribution'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Also known as a box and whisker plot, this visualization compares the distributions of a related metric across multiple groups. The box in the middle emphasizes the mean, median, and inner 2 quartiles. The whiskers around each box visualize the min, max, range, and outer 2 quartiles.',
        ),
        exampleGallery: [{ url: example, urlDark: exampleDark }],
        name: t('Box Plot'),
        tags: [t('ECharts'), t('Range'), t('Statistical'), t('Featured')],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
