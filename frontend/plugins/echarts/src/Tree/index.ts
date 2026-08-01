import { t } from '@zobi.dev/extension-api/translation';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/tree.png';
import exampleDark from './images/tree-dark.png';
import buildQuery from './buildQuery';
import { EchartsChartPlugin } from '../types';

export default class EchartsTreeChartPlugin extends EchartsChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsTree'),
      metadata: {
        category: t('Part of a Whole'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Visualize multiple levels of hierarchy using a familiar tree-like structure.',
        ),
        exampleGallery: [{ url: example, urlDark: exampleDark }],
        name: t('Tree Chart'),
        tags: [
          t('Categorical'),
          t('ECharts'),
          t('Multi-Levels'),
          t('Relational'),
          t('Structural'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
