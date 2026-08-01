import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import thumbnail from '../images/thumbnail.png';
import thumbnailDark from '../images/thumbnail-dark.png';
import example1 from '../images/example1.jpg';
import example1Dark from '../images/example1-dark.jpg';
import example2 from '../images/example2.jpg';
import example2Dark from '../images/example2-dark.jpg';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';

export default class HandlebarsChartPlugin extends ChartPlugin {
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
      description: t('Write a handlebars template to render the data'),
      name: t('Handlebars'),
      thumbnail,
      thumbnailDark,
      exampleGallery: [
        { url: example1, urlDark: example1Dark },
        { url: example2, urlDark: example2Dark },
      ],
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../Handlebars'),
      metadata,
      transformProps,
    });
  }
}
