import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import transformProps from './transformProps';
import controlPanel from './controlPanel';
import buildQuery from './buildQuery';
import { EchartsChartPlugin } from '../types';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/example1.png';
import example1Dark from './images/example1-dark.png';
import example2 from './images/example2.png';
import example2Dark from './images/example2-dark.png';

export default class EchartsGanttChartPlugin extends EchartsChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsGantt'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        credits: ['https://echarts.zobi.dev'],
        name: t('Gantt Chart'),
        description: t(
          'Gantt chart visualizes important events over a time span. ' +
            'Every data point displayed as a separate event along a ' +
            'horizontal line.',
        ),
        tags: [t('ECharts'), t('Featured'), t('Timeline'), t('Time')],
        thumbnail,
        thumbnailDark,
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
      },
      transformProps,
    });
  }
}
