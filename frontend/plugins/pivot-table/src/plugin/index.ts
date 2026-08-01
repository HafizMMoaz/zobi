import { t } from '@zobi.dev/extension-api/translation';
import {
  Behavior,
  ChartMetadata,
  ChartPlugin,
  ChartProps,
  QueryFormData,
} from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';
import thumbnailDark from '../images/thumbnail-dark.png';
import example from '../images/example.jpg';
import exampleDark from '../images/example-dark.jpg';
import { PivotTableQueryFormData } from '../types';

export default class PivotTableChartPlugin extends ChartPlugin<
  PivotTableQueryFormData,
  ChartProps<QueryFormData>
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
    const metadata = new ChartMetadata({
      behaviors: [
        Behavior.InteractiveChart,
        Behavior.DrillToDetail,
        Behavior.DrillBy,
      ],
      category: t('Table'),
      description: t(
        'Used to summarize a set of data by grouping together multiple statistics along two axes. Examples: Sales numbers by region and month, tasks by status and assignee, active users by age and location. Not the most visually stunning visualization, but highly informative and versatile.',
      ),
      exampleGallery: [{ url: example, urlDark: exampleDark }],
      name: t('Pivot Table'),
      tags: [t('Additive'), t('Report'), t('Tabular'), t('Featured')],
      thumbnail,
      thumbnailDark,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../PivotTableChart'),
      metadata,
      transformProps,
    });
  }
}
