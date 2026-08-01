import { t } from '@zobi.dev/extension-api/translation';
import { Behavior, ChartMetadata, ChartPlugin } from '@zobi.dev/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

export default class DeckglLayerVisibilityCustomizationPlugin extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      name: t('Deck.gl Layer Visibility'),
      description: t('Chart customization to control deck.gl layer visibility'),
      behaviors: [Behavior.InteractiveChart, Behavior.ChartCustomization],
      tags: [t('Deckgl'), t('Experimental')],
      thumbnail,
      enableNoResults: false,
      datasourceCount: 0,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./DeckglLayerVisibilityCustomizationPlugin'),
      metadata,
      transformProps,
    });
  }
}
