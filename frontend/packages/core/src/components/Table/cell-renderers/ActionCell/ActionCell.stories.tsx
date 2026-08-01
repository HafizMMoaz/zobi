import { StoryFn, Meta } from '@storybook/react';
import ActionCell from './index';
import { exampleMenuOptions, exampleRow } from './fixtures';

export default {
  title: 'Design System/Components/Table/Cell Renderers/ActionCell',
  component: ActionCell,
} as Meta<typeof ActionCell>;

export const Basic: StoryFn<typeof ActionCell> = args => (
  <ActionCell {...args} />
);

Basic.args = {
  menuOptions: exampleMenuOptions,
  row: exampleRow,
};
