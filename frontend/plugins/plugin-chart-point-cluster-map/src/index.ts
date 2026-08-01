import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/MapBox.jpg';
import example1Dark from './images/MapBox-dark.jpg';
import example2 from './images/MapBox2.jpg';
import example2Dark from './images/MapBox2-dark.jpg';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Map'),
  credits: ['https://maplibre.org/'],
  description: '',
  exampleGallery: [
    { url: example1, urlDark: example1Dark, caption: t('Light mode') },
    { url: example2, urlDark: example2Dark, caption: t('Dark mode') },
  ],
  name: t('Point Cluster Map'),
  tags: [
    t('Business'),
    t('Intensity'),
    t('Density'),
    t('Scatter'),
    t('Transformable'),
  ],
  thumbnail,
  thumbnailDark,
});

export default class ScatterMapChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./MapLibre'),
      loadTransformProps: () => import('./transformProps'),
      loadBuildQuery: () => import('./buildQuery'),
      metadata,
      controlPanel,
    });
  }
}
