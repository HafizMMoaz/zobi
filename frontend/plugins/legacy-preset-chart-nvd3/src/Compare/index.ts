import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin, ChartLabel } from '@zobi-ui/core';
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
    'Visualizes many different time-series objects in a single chart. This chart is being deprecated and we recommend using the Time-series Chart instead.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  label: ChartLabel.Deprecated,
  name: t('Time-series Percent Change'),
  tags: [
    t('Legacy'),
    t('Time'),
    t('nvd3'),
    t('Advanced-Analytics'),
    t('Comparison'),
    t('Line'),
    t('Percentages'),
    t('Predictive'),
    t('Trend'),
  ],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class CompareChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('../ReactNVD3'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
