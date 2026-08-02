import CategoricalScheme from '../../CategoricalScheme';
import { ColorSchemeGroup } from '../../types';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'zobiColors',
    label: 'Zobi Colors',
    group: ColorSchemeGroup.Featured,
    colors: [
      // Full color
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
      // Pastels
      '#FDEBD0',
      '#AAB7B8',
      '#A9DFBF',
      '#F5B7B1',
      '#D2B4DE',
      '#FAD7A0',
      '#A3E4D7',
      '#AED6F1',
      '#F9E79F',
      '#E5E8E8',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
