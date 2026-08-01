
import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/treemap_v2_1.png';
import example1Dark from './images/treemap_v2_1-dark.png';
import example2 from './images/treemap_v2_2.jpg';
import example2Dark from './images/treemap_v2_2-dark.jpg';
import { EchartsTreemapChartProps, EchartsTreemapFormData } from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsTreemapChartPlugin extends EchartsChartPlugin<
  EchartsTreemapFormData,
  EchartsTreemapChartProps
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
      loadChart: () => import('./EchartsTreemap'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Part of a Whole'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Show hierarchical relationships of data, with the value represented by area, showing proportion and contribution to the whole.',
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
        name: t('Treemap'),
        tags: [
          t('Categorical'),
          t('Comparison'),
          t('ECharts'),
          t('Multi-Levels'),
          t('Percentages'),
          t('Proportional'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
