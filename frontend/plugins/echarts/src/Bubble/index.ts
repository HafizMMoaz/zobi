import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import example1 from './images/example1.png';
import example1Dark from './images/example1-dark.png';
import example2 from './images/example2.png';
import example2Dark from './images/example2-dark.png';
import { EchartsBubbleChartProps, EchartsBubbleFormData } from './types';

// TODO: Implement cross filtering
export default class EchartsBubbleChartPlugin extends ChartPlugin<
  EchartsBubbleFormData,
  EchartsBubbleChartProps
> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsBubble'),
      metadata: new ChartMetadata({
        category: t('Correlation'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Visualizes a metric across three dimensions of data in a single chart (X axis, Y axis, and bubble size). Bubbles from the same group can be showcased using bubble color.',
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
        name: t('Bubble Chart'),
        tags: [
          t('Multi-Dimensions'),
          t('Comparison'),
          t('Scatter'),
          t('Time'),
          t('Trend'),
          t('ECharts'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      }),
      transformProps,
    });
  }
}
