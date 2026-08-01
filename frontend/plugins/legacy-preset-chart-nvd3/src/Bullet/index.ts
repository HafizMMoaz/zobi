import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from '../transformProps';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('KPI'),
  credits: ['http://nvd3.org'],
  description: t(
    'Showcases the progress of a single metric against a given target. The higher the fill, the closer the metric is to the target.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('Bullet Chart'),
  tags: [t('Business'), t('Legacy'), t('Report'), t('nvd3')],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class BulletChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('../ReactNVD3'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
