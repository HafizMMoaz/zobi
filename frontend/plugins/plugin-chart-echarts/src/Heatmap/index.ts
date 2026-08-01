import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import example1 from './images/example1.png';
import example1Dark from './images/example1-dark.png';
import example2 from './images/example2.png';
import example2Dark from './images/example2-dark.png';
import example3 from './images/example3.png';
import example3Dark from './images/example3-dark.png';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Correlation'),
  description: t(
    'Visualize a related metric across pairs of groups. Heatmaps excel at showcasing the correlation or strength between two groups. Color is used to emphasize the strength of the link between each pair of groups.',
  ),
  exampleGallery: [
    { url: example1, urlDark: example1Dark },
    { url: example2, urlDark: example2Dark },
    { url: example3, urlDark: example3Dark },
  ],
  name: t('Heatmap'),
  tags: [
    t('Business'),
    t('Intensity'),
    t('Density'),
    t('Single Metric'),
    t('ECharts'),
    t('Featured'),
  ],
  thumbnail,
  thumbnailDark,
});

export default class EchartsHeatmapChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('./Heatmap'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
