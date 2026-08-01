import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/example1.png';
import example2 from './images/example2.png';
import example3 from './images/example3.png';
import example1Dark from './images/example1-dark.png';
import example2Dark from './images/example2-dark.png';
import example3Dark from './images/example3-dark.png';
import { EchartsWaterfallChartProps, EchartsWaterfallFormData } from './types';

// TODO: Implement cross filtering
export default class EchartsWaterfallChartPlugin extends ChartPlugin<
  EchartsWaterfallFormData,
  EchartsWaterfallChartProps
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
      loadChart: () => import('./EchartsWaterfall'),
      metadata: new ChartMetadata({
        credits: ['https://echarts.zobi.dev'],
        category: t('Evolution'),
        description: t(
          `A waterfall chart is a form of data visualization that helps in understanding
          the cumulative effect of sequentially introduced positive or negative values.
          These intermediate values can either be time based or category based.`,
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
          { url: example3, urlDark: example3Dark },
        ],
        name: t('Waterfall Chart'),
        tags: [t('Categorical'), t('Comparison'), t('ECharts'), t('Featured')],
        thumbnail,
        thumbnailDark,
      }),
      transformProps,
    });
  }
}
