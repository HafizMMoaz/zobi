import { t } from '@zobi/core/translation';
import { Behavior, ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

export default class ChartCustomizationDynamicGroupByPlugin extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      name: t('Dynamic group by'),
      description: t('Dynamically select grouping columns from a dataset'),
      behaviors: [Behavior.ChartCustomization],
      tags: [t('Grouping'), t('Dynamic')],
      thumbnail,
      datasourceCount: 1,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./DynamicGroupByPlugin'),
      metadata,
      transformProps,
    });
  }
}
