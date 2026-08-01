import { Meta, StoryObj } from '@storybook/react';
import { TagsList, type TagsListProps } from 'src/components/TagsList';

export default {
  title: 'Components/TagsList',
  component: TagsList,
  argTypes: {
    tags: {
      control: false,
      description: 'List of tags to display',
      table: {
        category: 'Tag List',
        type: { summary: 'number | object' },
      },
    },
    editable: {
      control: 'boolean',
      description: 'Whether the tags are editable',
      table: {
        category: 'Tag List',
        type: { summary: 'boolean' },
      },
    },
    maxTags: {
      control: 'number',
      description: 'Maximum number of tags to display',
      table: {
        category: 'Tag List',
        type: { summary: 'number | undefined' },
      },
    },
    onDelete: {
      table: {
        disable: true,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The TagsList component displays a list of tags. It can be configured to be editable, allowing users to delete tags. The maxTags prop limits the number of tags displayed before truncating.',
      },
    },
  },
} as Meta<TagsListProps>;

type Story = StoryObj<TagsListProps>;

export const TagsListStory: Story = {
  args: {
    tags: [
      { name: 'tag1' },
      { name: 'tag2' },
      { name: 'tag3' },
      { name: 'tag4' },
      { name: 'tag5' },
      { name: 'tag6' },
    ],
  },
  render: (args: TagsListProps) => <TagsList {...args} />,
};
