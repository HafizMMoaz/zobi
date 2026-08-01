import { StoryFn, Meta } from '@storybook/react';
import BooleanCell from '.';

export default {
  title: 'Design System/Components/Table/Cell Renderers/BooleanCell',
  component: BooleanCell,
} as Meta<typeof BooleanCell>;

export const Basic: StoryFn<typeof BooleanCell> = args => (
  <BooleanCell {...args} />
);

Basic.args = {
  value: true,
};
