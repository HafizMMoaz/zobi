import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'wavesOfBlue',
    label: 'Waves of blue',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#070061',
      '#0A0095',
      '#0054B4',
      '#006BE7',
      '#2289FF',
      '#4A9FFF',
      '#76B6FF',
      '#9DCBFF',
      '#BEDCFF',
      '#DAEBFF',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
