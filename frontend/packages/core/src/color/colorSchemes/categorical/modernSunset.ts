import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'modernSunset',
    label: 'Modern sunset',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#0080F6',
      '#254081',
      '#6C4592',
      '#A94693',
      '#DC4180',
      '#F35193',
      '#FF7582',
      '#FF4C5D',
      '#FF824E',
      '#FFAD2A',
      '#FFDB04',
      '#F3F700',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
