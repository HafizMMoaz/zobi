import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin, Behavior } from '@zobi-ui/core';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/WorldMap1.jpg';
import example1Dark from './images/WorldMap1-dark.jpg';
import example2 from './images/WorldMap2.jpg';
import example2Dark from './images/WorldMap2-dark.jpg';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Map'),
  credits: ['http://datamaps.github.io/'],
  description: t(
    'A map of the world, that can indicate values in different countries.',
  ),
  exampleGallery: [
    { url: example1, urlDark: example1Dark },
    { url: example2, urlDark: example2Dark },
  ],
  name: t('World Map'),
  tags: [
    t('2D'),
    t('Comparison'),
    t('Intensity'),
    t('Legacy'),
    t('Multi-Dimensions'),
    t('Multi-Layers'),
    t('Multi-Variables'),
    t('Scatter'),
    t('Featured'),
  ],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
  behaviors: [
    Behavior.InteractiveChart,
    Behavior.DrillToDetail,
    Behavior.DrillBy,
  ],
});

export default class WorldMapChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactWorldMap'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
