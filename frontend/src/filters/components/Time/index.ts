import { t } from '@zobi/core/translation';
import { Behavior, ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

export default class TimeFilterPlugin extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      name: t('Time filter'),
      description: t('Custom time filter plugin'),
      behaviors: [Behavior.InteractiveChart, Behavior.NativeFilter],
      thumbnail,
      tags: [t('Experimental')],
      datasourceCount: 0,
    });

    super({
      controlPanel,
      loadChart: () => import('./TimeFilterPlugin'),
      metadata,
      transformProps,
    });
  }
}
