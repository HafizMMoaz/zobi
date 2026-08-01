import { t } from '@zobi.dev/extension-api/translation';
import { Behavior, ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

export default class ChartCustomizationTimeColumnPlugin extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      name: t('Time column'),
      description: t('Time column chart customization plugin'),
      behaviors: [Behavior.InteractiveChart, Behavior.ChartCustomization],
      tags: [t('Experimental')],
      thumbnail,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./TimeColumnFilterPlugin'),
      metadata,
      transformProps,
    });
  }
}
