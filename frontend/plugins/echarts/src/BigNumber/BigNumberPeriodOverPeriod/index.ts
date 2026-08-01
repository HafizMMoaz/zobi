import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';

export default class PopKPIPlugin extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      category: t('KPI'),
      description:
        'Showcases a metric along with a comparison of value, change, and percent change for a selected time period.',
      name: t('Big Number with Time Period Comparison'),
      tags: [
        t('Comparison'),
        t('Business'),
        t('ECharts'),
        t('Percentages'),
        t('Report'),
        t('Advanced-Analytics'),
      ],
      thumbnail,
      thumbnailDark,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./PopKPI'),
      metadata,
      transformProps,
    });
  }
}
