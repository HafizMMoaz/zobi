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
    'A map that takes rendering circles with a variable radius at latitude/longitude coordinates',
  ),
  name: t('deck.gl Scatterplot'),
  thumbnail,
  thumbnailDark,
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  tags: [
    t('deckGL'),
    t('Comparison'),
    t('Scatter'),
    t('2D'),
    t('Geo'),
    t('Intensity'),
    t('Density'),
  ],
  behaviors: [Behavior.InteractiveChart],
});

export default class ScatterChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Scatter'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
