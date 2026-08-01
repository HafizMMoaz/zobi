import { t } from '@zobi/core/translation';
import { Behavior } from '@zobi-ui/core';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';
import buildQuery from './buildQuery';
import example1 from './images/Sunburst1.png';
import example1Dark from './images/Sunburst1-dark.png';
import example2 from './images/Sunburst2.png';
import example2Dark from './images/Sunburst2-dark.png';
import { EchartsChartPlugin } from '../types';

export default class EchartsSunburstChartPlugin extends EchartsChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsSunburst'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Part of a Whole'),
        credits: ['https://echarts.zobi.dev'],
        description: t(
          'Uses circles to visualize the flow of data through different stages of a system. Hover over individual paths in the visualization to understand the stages a value took. Useful for multi-stage, multi-group visualizing funnels and pipelines.',
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
        name: t('Sunburst Chart'),
        tags: [
          t('ECharts'),
          t('Multi-Levels'),
          t('Proportional'),
          t('Featured'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
