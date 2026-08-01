

import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { WordCloudFormData } from '../types';
import thumbnail from '../images/thumbnail.png';
import thumbnailDark from '../images/thumbnail-dark.png';
import example1 from '../images/Word_Cloud.jpg';
import example1Dark from '../images/Word_Cloud-dark.jpg';
import example2 from '../images/Word_Cloud_2.jpg';
import example2Dark from '../images/Word_Cloud_2-dark.jpg';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Ranking'),
  credits: ['https://github.com/jasondavies/d3-cloud'],
  description: t(
    'Visualizes the words in a column that appear the most often. Bigger font corresponds to higher frequency.',
  ),
  exampleGallery: [
    { url: example1, urlDark: example1Dark },
    { url: example2, urlDark: example2Dark },
  ],
  name: t('Word Cloud'),
  tags: [t('Categorical'), t('Comparison'), t('Density'), t('Single Metric')],
  thumbnail,
  thumbnailDark,
});

export default class WordCloudChartPlugin extends ChartPlugin<WordCloudFormData> {
  constructor() {
    super({
      buildQuery,
      loadChart: () => import('../chart/WordCloud'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
