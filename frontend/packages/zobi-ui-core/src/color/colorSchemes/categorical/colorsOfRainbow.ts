

import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'colorsOfRainbow',
    label: 'Colors of rainbow',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#41ED86',
      '#2FC096',
      '#01DFFF',
      '#153AE0',
      '#850AD6',
      '#BD59FF',
      '#FF4A96',
      '#C32668',
      '#F40000',
      '#FF8901',
      '#FFBC0A',
      '#FFEC43',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
