import { t } from '@zobi.dev/extension-api/translation';
import { ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example from './images/example.jpg';
import exampleDark from './images/example-dark.jpg';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Part of a Whole'),
  description: t('Compare the same summarized metric across multiple groups.'),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('Partition Chart'),
  tags: [t('Categorical'), t('Comparison'), t('Legacy'), t('Proportional')],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class PartitionChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactPartition'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
