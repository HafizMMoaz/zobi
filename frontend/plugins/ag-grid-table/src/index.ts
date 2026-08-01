import { t } from '@zobi.dev/extension-api/translation';
import { Behavior, ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/Table.jpg';
import example1Dark from './images/Table-dark.jpg';
import example2 from './images/Table2.jpg';
import example2Dark from './images/Table2-dark.jpg';
import example3 from './images/Table3.jpg';
import example3Dark from './images/Table3-dark.jpg';
import controlPanel from './controlPanel';
import buildQuery from './buildQuery';
import { TableChartFormData, TableChartProps } from './types';

// must export something for the module to be exist in dev mode
export { default as __hack__ } from './types';
export * from './types';
export {
  convertAgGridStateToOwnState,
  convertSortModel,
  convertColumnState,
  convertFilterModel,
} from './stateConversion';

const metadata = new ChartMetadata({
  behaviors: [
    Behavior.InteractiveChart,
    Behavior.DrillToDetail,
    Behavior.DrillBy,
  ],
  category: t('Table'),
  canBeAnnotationTypes: ['EVENT', 'INTERVAL'],
  description: t(
    'Classic row-by-column spreadsheet like view of a dataset. Use tables to showcase a view into the underlying data or to show aggregated metrics.',
  ),
  exampleGallery: [
    { url: example1, urlDark: example1Dark },
    { url: example2, urlDark: example2Dark },
    { url: example3, urlDark: example3Dark },
  ],
  name: t('Table V2'),
  tags: [
    t('Additive'),
    t('Business'),
    t('Pattern'),
    t('Featured'),
    t('Report'),
    t('Sequential'),
    t('Tabular'),
  ],
  thumbnail,
  thumbnailDark,
});

export default class AgGridTableChartPlugin extends ChartPlugin<
  TableChartFormData,
  TableChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./AgGridTableChart'),
      metadata,
      transformProps,
      controlPanel,
      buildQuery,
    });
  }
}
