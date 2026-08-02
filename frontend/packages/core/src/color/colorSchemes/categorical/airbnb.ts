import CategoricalScheme from '../../CategoricalScheme';

// TODO: add the colors to the theme while working on SIP https://github.com/HafizMMoaz/zobi/issues/20159
const schemes = [
  {
    id: 'bnbColors',
    label: 'Airbnb Colors',
    colors: [
      '#29696B',
      '#5BCACE',
      '#F4B02A',
      '#F1826A',
      '#792EB2',
      '#C96EC6',
      '#921E50',
      '#B27700',
      '#9C3498',
      '#9C3498',
      '#E4679D',
      '#C32F0E',
      '#9D63CA',
    ],
  },
].map(s => new CategoricalScheme(s));

export default schemes;
