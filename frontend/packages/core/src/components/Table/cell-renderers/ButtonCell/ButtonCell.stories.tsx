import { StoryFn, Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { ButtonCell } from './index';

export default {
  title: 'Design System/Components/Table/Cell Renderers/ButtonCell',
  component: ButtonCell,
} as Meta<typeof ButtonCell>;

const clickHandler = action('button cell onClick');

export const Basic: StoryFn<typeof ButtonCell> = args => (
  <ButtonCell {...args} />
);

Basic.args = {
  onClick: clickHandler,
  label: 'Primary',
  row: {
    key: 1,
    buttonCell: 'Click Me',
    textCell: 'Some text',
    euroCell: 45.5,
    dollarCell: 45.5,
  },
};

export const Secondary: StoryFn<typeof ButtonCell> = args => (
  <ButtonCell {...args} />
);

Secondary.args = {
  onClick: clickHandler,
  label: 'Secondary',
  buttonStyle: 'secondary',
  row: {
    key: 1,
    buttonCell: 'Click Me',
    textCell: 'Some text',
    euroCell: 45.5,
    dollarCell: 45.5,
  },
};
