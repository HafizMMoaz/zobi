import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import example1 from './images/BigNumber.jpg';
import example1Dark from './images/BigNumber-dark.jpg';
import example2 from './images/BigNumber2.jpg';
import example2Dark from './images/BigNumber2-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import { BigNumberTotalChartProps, BigNumberTotalFormData } from '../types';
import { EchartsChartPlugin } from '../../types';

const metadata = {
  category: t('KPI'),
  description: t(
    'Showcases a single metric front-and-center. Big number is best used to call attention to a KPI or the one thing you want your audience to focus on.',
  ),
  exampleGallery: [
    { url: example1, urlDark: example1Dark, caption: t('A Big Number') },
    { url: example2, urlDark: example2Dark, caption: t('With a subheader') },
  ],
  name: t('Big Number'),
  tags: [
    t('Additive'),
    t('Business'),
    t('ECharts'),
    t('Legacy'),
    t('Percentages'),
    t('Featured'),
    t('Report'),
  ],
  thumbnail,
  thumbnailDark,
  behaviors: [Behavior.DrillToDetail],
};

export default class BigNumberTotalChartPlugin extends EchartsChartPlugin<
  BigNumberTotalFormData,
  BigNumberTotalChartProps
> {
  constructor() {
    super({
      loadChart: () => import('../BigNumberViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}
