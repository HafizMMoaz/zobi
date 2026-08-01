import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin, Behavior } from '@zobi.dev/core';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.png';
import exampleDark from './images/example-dark.png';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Map'),
  credits: ['https://uber.github.io/deck.gl'],
  behaviors: [
    Behavior.InteractiveChart,
    Behavior.DrillBy,
    Behavior.DrillToDetail,
  ],
  description: t(
    'Plot the distance (like flight paths) between origin and destination.',
  ),
  name: t('deck.gl Arc'),
  thumbnail,
  thumbnailDark,
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  tags: [t('deckGL'), t('Geo'), t('3D'), t('Relational'), t('Web')],
});

export default class ArcChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Arc'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
