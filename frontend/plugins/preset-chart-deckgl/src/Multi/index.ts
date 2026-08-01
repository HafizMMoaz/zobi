import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.png';
import exampleDark from './images/example-dark.png';
import transformProps from '../transformProps';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Map'),
  credits: ['https://uber.github.io/deck.gl'],
  description: t('Compose multiple layers together to form complex visuals.'),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('deck.gl Multiple Layers'),
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
  tags: [t('deckGL'), t('Multi-Layers')],
});

export default class MultiChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./Multi'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
