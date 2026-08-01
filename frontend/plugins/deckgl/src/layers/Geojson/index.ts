import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin, Behavior } from '@zobi.dev/core';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.png';
import exampleDark from './images/example-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Map'),
  credits: ['https://uber.github.io/deck.gl'],
  description: t(
    'The GeoJsonLayer takes in GeoJSON formatted data and renders it as interactive polygons, lines and points (circles, icons and/or texts).',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('deck.gl Geojson'),
  thumbnail,
  thumbnailDark,
  tags: [t('deckGL'), t('2D')],
  behaviors: [Behavior.InteractiveChart],
});

export default class GeojsonChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./Geojson'),
      loadTransformProps: () => import('./transformProps'),
      loadBuildQuery: () => import('./buildQuery'),
      controlPanel,
      metadata,
    });
  }
}
