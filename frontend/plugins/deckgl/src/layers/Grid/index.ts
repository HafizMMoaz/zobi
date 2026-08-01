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
    'Visualize geospatial data like 3D buildings, landscapes, or objects in grid view.',
  ),
  name: t('deck.gl Grid'),
  thumbnail,
  thumbnailDark,
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  tags: [t('deckGL'), t('3D'), t('Comparison')],
  behaviors: [Behavior.InteractiveChart],
});

export default class GridChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Grid'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
