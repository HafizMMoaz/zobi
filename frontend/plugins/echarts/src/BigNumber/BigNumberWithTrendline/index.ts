import { t } from '@zobi.dev/extension-api/translation';
import { Behavior } from '@zobi.dev/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import example from './images/Big_Number_Trendline.jpg';
import exampleDark from './images/Big_Number_Trendline-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import {
  BigNumberWithTrendlineChartProps,
  BigNumberWithTrendlineFormData,
} from '../types';
import { EchartsChartPlugin } from '../../types';

const metadata = {
  category: t('KPI'),
  description: t(
    'Showcases a single number accompanied by a simple line chart, to call attention to an important metric along with its change over time or other dimension.',
  ),
  exampleGallery: [{ url: example, urlDark: exampleDark }],
  name: t('Big Number with Trendline'),
  tags: [
    t('Advanced-Analytics'),
    t('ECharts'),
    t('Line'),
    t('Percentages'),
    t('Featured'),
    t('Report'),
    t('Trend'),
  ],
  thumbnail,
  thumbnailDark,
  behaviors: [Behavior.DrillToDetail],
};

export default class BigNumberWithTrendlineChartPlugin extends EchartsChartPlugin<
  BigNumberWithTrendlineFormData,
  BigNumberWithTrendlineChartProps
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
