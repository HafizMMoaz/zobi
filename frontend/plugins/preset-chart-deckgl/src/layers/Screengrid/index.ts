import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin, Behavior } from '@zobi-ui/core';
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
    'Aggregates data within the boundary of grid cells and maps the aggregated values to a dynamic color scale',
  ),
  name: t('deck.gl Screen Grid'),
  thumbnail,
  thumbnailDark,
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  tags: [t('deckGL'), t('Comparison'), t('Intensity'), t('Density')],
  behaviors: [Behavior.InteractiveChart],
});

export default class ScreengridChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Screengrid'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
