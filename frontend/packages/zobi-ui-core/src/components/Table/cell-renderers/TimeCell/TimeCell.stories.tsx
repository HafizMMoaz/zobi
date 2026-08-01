import { StoryFn, Meta } from '@storybook/react';
import { TimeFormats } from '@zobi-ui/core';
import TimeCell from '.';

export default {
  title: 'Design System/Components/Table/Cell Renderers/TimeCell',
  component: TimeCell,
} as Meta<typeof TimeCell>;

export const Basic: StoryFn<typeof TimeCell> = args => <TimeCell {...args} />;

Basic.args = {
  value: new Date('2015-07-02T16:16:00Z').getTime(),
};

Basic.argTypes = {
  format: {
    defaultValue: TimeFormats.DATABASE_DATETIME,
    control: 'select',
    options: Object.values(TimeFormats),
  },
};
