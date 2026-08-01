import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import { transformProps, controlPanel } from './config';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';

const metadata = new ChartMetadata({
  category: t('Table'),
  name: t('Time-series Table'),
  description: t(
    'Compare multiple time series charts (as sparklines) and related metrics quickly.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  tags: [
    t('Multi-Variables'),
    t('Comparison'),
    t('Legacy'),
    t('Percentages'),
    t('Tabular'),
    t('Text'),
    t('Trend'),
  ],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class TimeTableChartPlugin extends ChartPlugin {
  constructor() {
    super({
      metadata,
      transformProps,
      loadChart: () => import('./TimeTable'),
      controlPanel,
    });
  }
}
