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
  description: t(
    'A polar coordinate chart where the circle is broken into wedges of equal angle, and the value represented by any wedge is illustrated by its area, rather than its radius or sweep angle.',
  ),
  exampleGallery: [
    { url: example1, urlDark: example1Dark },
    { url: example2, urlDark: example2Dark },
  ],
  name: t('Nightingale Rose Chart'),
  tags: [
    t('Legacy'),
    t('Advanced-Analytics'),
    t('Circular'),
    t('Multi-Layers'),
    t('Pattern'),
    t('Time'),
    t('Trend'),
  ],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class RoseChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactRose'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
