import { ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import { t } from '@zobi.dev/extension-api/translation';
import transformProps from './transformProps';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import controlPanel from './controlPanel';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';

const metadata = new ChartMetadata({
  category: t('Correlation'),
  credits: ['https://github.com/wa0x6e/cal-heatmap'],
  description: t(
    "Visualizes how a metric has changed over a time using a color scale and a calendar view. Gray values are used to indicate missing values and the linear color scheme is used to encode the magnitude of each day's value.",
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('Calendar Heatmap'),
  tags: [
    t('Business'),
    t('Comparison'),
    t('Intensity'),
    t('Pattern'),
    t('Report'),
    t('Trend'),
  ],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class CalendarChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactCalendar'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
