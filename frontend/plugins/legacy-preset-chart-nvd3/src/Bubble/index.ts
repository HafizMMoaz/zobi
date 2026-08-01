import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin, ChartLabel } from '@zobi-ui/core';
import transformProps from '../transformProps';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Correlation'),
  credits: ['http://nvd3.org'],
  description: t(
    'Visualizes a metric across three dimensions of data in a single chart (X axis, Y axis, and bubble size). Bubbles from the same group can be showcased using bubble color.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  label: ChartLabel.Deprecated,
  name: t('Bubble Chart (legacy)'),
  tags: [
    t('Multi-Dimensions'),
    t('Comparison'),
    t('Legacy'),
    t('Scatter'),
    t('Time'),
    t('Trend'),
    t('nvd3'),
  ],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

/**
 * @deprecated in version 4.0.
 */
export default class BubbleChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('../ReactNVD3'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
