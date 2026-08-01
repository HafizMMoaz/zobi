import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin, Behavior } from '@zobi.dev/core';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.png';
import exampleDark from './images/example-dark.png';
import buildQuery from './buildQuery';
import transformProps from './transformProps';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Map'),
  credits: ['https://uber.github.io/deck.gl'],
  description: t(
    'Overlays a hexagonal grid on a map, and aggregates data within the boundary of each cell.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('deck.gl 3D Hexagon'),
  thumbnail,
  thumbnailDark,
  tags: [t('deckGL'), t('3D'), t('Geo'), t('Comparison')],
  behaviors: [Behavior.InteractiveChart],
});

export default class HexChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Hex'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
