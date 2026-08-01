import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import transformProps from '../transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Evolution'),
  credits: ['http://nvd3.org'],
  description: t(
    'Compares metrics between different time periods. Displays time series data across multiple periods (like weeks or months) to show period-over-period trends and patterns.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('Time-series Period Pivot'),
  tags: [t('Legacy'), t('Time'), t('nvd3')],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class TimePivotChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('../ReactNVD3'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
