import { t } from '@zobi/core/translation';
import { ChartMetadata, ChartPlugin } from '@zobi-ui/core';
import transformProps from './transformProps';
import exampleUsa from './images/exampleUsa.jpg';
import exampleUsaDark from './images/exampleUsa-dark.jpg';
import exampleGermany from './images/exampleGermany.jpg';
import exampleGermanyDark from './images/exampleGermany-dark.jpg';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import controlPanel from './controlPanel';

const metadata = new ChartMetadata({
  category: t('Map'),
  credits: ['https://bl.ocks.org/john-guerra'],
  description: t(
    "Visualizes how a single metric varies across a country's principal subdivisions (states, provinces, etc) on a choropleth map. Each subdivision's value is elevated when you hover over the corresponding geographic boundary.",
  ),
  exampleGallery: [
    { url: exampleUsa, urlDark: exampleUsaDark },
    { url: exampleGermany, urlDark: exampleGermanyDark },
  ],
  name: t('Country Map'),
  tags: [
    t('2D'),
    t('Comparison'),
    t('Geo'),
    t('Range'),
    t('Report'),
    t('Stacked'),
  ],
  thumbnail,
  thumbnailDark,
  useLegacyApi: true,
});

export default class CountryMapChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactCountryMap'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}

export { default as countries } from './countries';
