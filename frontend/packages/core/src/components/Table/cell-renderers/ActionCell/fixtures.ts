import { action } from '@storybook/addon-actions';
import { ActionMenuItem } from './index';

export const exampleMenuOptions: ActionMenuItem[] = [
  {
    label: 'Action 1',
    tooltip: "This is a tip, don't spend it all in one place",
    onClick: action('menu item onClick'),
    payload: {
      taco: 'spicy chicken',
    },
  },
  {
    label: 'Action 2',
    tooltip: 'This is another tip',
    onClick: action('menu item onClick'),
    payload: {
      taco: 'saucy tofu',
    },
  },
];

export const exampleRow = {
  key: 1,
  buttonCell: 'Click Me',
  textCell: 'Some text',
  euroCell: 45.5,
  dollarCell: 45.5,
};
