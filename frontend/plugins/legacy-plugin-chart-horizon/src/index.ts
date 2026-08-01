import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from './transformProps';
import example from './images/Horizon_Chart.jpg';
import exampleDark from './images/Horizon_Chart-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Distribution'),
  credits: ['http://kmandov.github.io/d3-horizon-chart/'],
  description: t(
    'Compares how a metric changes over time between different groups. Each group is mapped to a row and change over time is visualized bar lengths and color.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('Horizon Chart'),
  tags: [t('Legacy')],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class HorizonChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./HorizonChart'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
