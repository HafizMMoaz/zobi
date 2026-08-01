import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/example1.jpg';
import example1Dark from './images/example1-dark.jpg';
import example2 from './images/example2.jpg';
import example2Dark from './images/example2-dark.jpg';
import buildQuery from './buildQuery';
import { EchartsGaugeChartProps, EchartsGaugeFormData } from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsGaugeChartPlugin extends EchartsChartPlugin<
  EchartsGaugeFormData,
  EchartsGaugeChartProps
> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsGauge'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('KPI'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Uses a gauge to showcase progress of a metric towards a target. The position of the dial represents the progress and the terminal value in the gauge represents the target value.',
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
        name: t('Gauge Chart'),
        tags: [
          t('Multi-Variables'),
          t('Business'),
          t('Comparison'),
          t('ECharts'),
          t('Report'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
