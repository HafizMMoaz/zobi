import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from './transformProps';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Correlation'),
  description: t(
    'Table that visualizes paired t-tests, which are used to understand statistical differences between groups.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('Paired t-test Table'),
  tags: [t('Legacy'), t('Statistical'), t('Tabular')],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class PairedTTestChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./PairedTTest'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
