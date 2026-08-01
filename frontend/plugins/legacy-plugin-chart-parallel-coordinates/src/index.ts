import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/example1.jpg';
import example1Dark from './images/example1-dark.jpg';
import example2 from './images/example2.jpg';
import example2Dark from './images/example2-dark.jpg';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Ranking'),
  credits: ['https://syntagmatic.github.io/parallel-coordinates'],
  description: t(
    'Plots the individual metrics for each row in the data vertically and links them together as a line. This chart is useful for comparing multiple metrics across all of the samples or rows in the data.',
  ),
  exampleGallery: [
    { url: example1, urlDark: example1Dark },
    { url: example2, urlDark: example2Dark },
  ],
  name: t('Parallel Coordinates'),
  tags: [t('Directional'), t('Legacy'), t('Relational')],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class ParallelCoordinatesChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactParallelCoordinates'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
