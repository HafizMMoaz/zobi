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
  description: t('Visualizes connected points, which form a path, on a map.'),
  name: t('deck.gl Path'),
  thumbnail,
  thumbnailDark,
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  tags: [t('deckGL'), t('Web')],
  behaviors: [Behavior.InteractiveChart],
});

export default class PathChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Path'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
