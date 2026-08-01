

import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'blueToGreen',
    label: 'Blue to green',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#3200A7',
      '#004CDA',
      '#0074F1',
      '#0096EF',
      '#53BFFF',
      '#41C8E6',
      '#30DEDE',
      '#04D9C7',
      '#00EAA2',
      '#A6FF93',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
