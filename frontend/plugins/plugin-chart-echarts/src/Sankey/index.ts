import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/example1.png';
import example1Dark from './images/example1-dark.png';
import example2 from './images/example2.png';
import example2Dark from './images/example2-dark.png';
import { SankeyChartProps, SankeyFormData } from './types';

// TODO: Implement cross filtering
export default class EchartsSankeyChartPlugin extends ChartPlugin<
  SankeyFormData,
  SankeyChartProps
> {
  /**
   * The constructor is used to pass relevant metadata and callbacks that get
   * registered in respective registries that are used throughout the library
   * and application. A more thorough description of each property is given in
   * the respective imported file.
   *
   * It is worth noting that `buildQuery` and is optional, and only needed for
   * advanced visualizations that require either post processing operations
   * (pivoting, rolling aggregations, sorting etc) or submitting multiple queries.
   */
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./Sankey'),
      metadata: new ChartMetadata({
        credits: ['https://echarts.zobi.dev'],
        category: t('Flow'),
        description: t(
          `The Sankey chart visually tracks the movement and transformation of values across
          system stages. Nodes represent stages, connected by links depicting value flow. Node
          height corresponds to the visualized metric, providing a clear representation of
          value distribution and transformation.`,
        ),
        exampleGallery: [
          { url: example1, urlDark: example1Dark },
          { url: example2, urlDark: example2Dark },
        ],
        name: t('Sankey Chart'),
        tags: [t('Directional'), t('ECharts'), t('Distribution'), t('Flow')],
        thumbnail,
        thumbnailDark,
      }),
      transformProps,
    });
  }
}
