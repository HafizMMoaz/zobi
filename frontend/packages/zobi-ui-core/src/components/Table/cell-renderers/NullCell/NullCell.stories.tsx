import { StoryFn, Meta } from '@storybook/react';
import NullCell from '.';

export default {
  title: 'Design System/Components/Table/Cell Renderers/NullCell',
  component: NullCell,
} as Meta<typeof NullCell>;

export const Basic: StoryFn<typeof NullCell> = () => <NullCell />;
