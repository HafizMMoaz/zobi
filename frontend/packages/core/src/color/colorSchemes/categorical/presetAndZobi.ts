import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'zobiAndPresetColors',
    label: 'Preset + Zobi',
    group: ColorSchemeGroup.Featured,
    colors: [
      '#004960',
      '#DA8F29',
      '#2C3E50',
      '#27AE60',
      '#E74C3C',
      '#8E44AD',
      '#F39C12',
      '#1ABC9C',
      '#3498DB',
      '#D35400',
      '#7F8C8D',
      '#067162',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
