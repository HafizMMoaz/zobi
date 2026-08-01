import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import buildQuery from './buildQuery';
import { EchartsChartPlugin } from '../types';

export default class EchartsGraphChartPlugin extends EchartsChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsGraph'),
      metadata: {
        category: t('Flow'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Displays connections between entities in a graph structure. Useful for mapping relationships and showing which nodes are important in a network. Graph charts can be configured to be force-directed or circulate. If your data has a geospatial component, try the deck.gl Arc chart.',
        ),
        exampleGallery: [{ url: example, urlDark: exampleDark }],
        name: t('Graph Chart'),
        tags: [
          t('Circular'),
          t('Comparison'),
          t('Directional'),
          t('ECharts'),
          t('Relational'),
          t('Structural'),
          t('Transformable'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
      },
      transformProps,
    });
  }
}
