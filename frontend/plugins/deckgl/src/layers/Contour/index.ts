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
    'Uses Gaussian Kernel Density Estimation to visualize spatial distribution of data',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('deck.gl Contour'),
  thumbnail,
  thumbnailDark,
  tags: [t('deckGL'), t('Spatial'), t('Comparison')],
  behaviors: [Behavior.InteractiveChart],
});

export default class ContourChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Contour'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}

export { getSafeCellSize } from './getSafeCellSize';
