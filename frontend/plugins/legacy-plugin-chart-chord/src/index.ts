import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from './transformProps';
import example from './images/chord.jpg';
import exampleDark from './images/chord-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Flow'),
  credits: ['https://github.com/d3/d3-chord'],
  description: t(
    'Showcases the flow or link between categories using thickness of chords. The value and corresponding thickness can be different for each side.',
  ),
  exampleGallery: [
    {
      url: example,
      urlDark: exampleDark,
      caption: t('Relationships between community channels'),
    },
  ],
  name: t('Chord Diagram'),
  tags: [t('Circular'), t('Legacy'), t('Proportional'), t('Relational')],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class ChordChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactChord'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
