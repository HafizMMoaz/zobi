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
  description: t(
    'Visualizes geographic areas from your data as polygons on a Mapbox rendered map. Polygons can be colored using a metric.',
  ),
  name: t('deck.gl Polygon'),
  thumbnail,
  thumbnailDark,
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  tags: [t('deckGL'), t('3D'), t('Multi-Dimensions'), t('Geo')],
  behaviors: [Behavior.InteractiveChart],
});

export default class PolygonChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Polygon'),
      controlPanel,
      metadata,
      transformProps,
    });
  }
}
