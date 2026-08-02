import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'redToYellow',
    label: 'Red to yellow',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#90042A',
      '#D60039',
      '#D1353B',
      '#E45233',
      '#F47028',
      '#FE8E17',
      '#FFAD00',
      '#FFCC00',
      '#FFE601',
      '#FFF46D',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
