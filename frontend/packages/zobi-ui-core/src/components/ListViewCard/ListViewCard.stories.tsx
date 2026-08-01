import type { Meta, StoryObj } from '@storybook/react';
import { ListViewCard } from '.';

export default {
  title: 'Components/ListViewCard',
  component: ListViewCard,
  parameters: {
    docs: {
      description: {
        component:
          'ListViewCard is a card component used to display items in list views with an image, title, description, and optional cover sections.',
      },
    },
  },
} as Meta<typeof ListViewCard>;

type Story = StoryObj<typeof ListViewCard>;

export const InteractiveListViewCard: Story = {
  args: {
    title: 'Zobi Card Title',
    loading: false,
    url: '/zobi/dashboard/births/',
    imgURL: 'https://picsum.photos/seed/zobi/300/200',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    coverLeft: 'Left Section',
    coverRight: 'Right Section',
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Title displayed on the card.',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the card is in loading state.',
    },
    url: {
      name: 'url',
      control: { type: 'text' },
      description: 'URL the card links to.',
    },
    imgURL: {
      name: 'imgURL',
      control: { type: 'text' },
      description: 'Primary image URL for the card.',
    },
    description: {
      control: { type: 'text' },
      description: 'Description text displayed on the card.',
    },
    coverLeft: {
      control: { type: 'text' },
      description: 'Content for the left section of the cover.',
    },
    coverRight: {
      control: { type: 'text' },
      description: 'Content for the right section of the cover.',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A card component for displaying items in list views with images and descriptions.',
      },
      liveExample: `function Demo() {
  return (
    <ListViewCard
      title="My Dashboard"
      description="A sample dashboard card"
      url="/dashboard/1"
      imgURL="https://picsum.photos/seed/demo/300/200"
      coverLeft="Created: Jan 2024"
      coverRight="Views: 1,234"
    />
  );
}`,
    },
  },
};

// Keep original for backwards compatibility
export const ZobiListViewCard: Story = {
  args: {
    title: 'Zobi Card Title',
    loading: false,
    url: '/zobi/dashboard/births/',
    imgURL: 'https://picsum.photos/seed/zobi2/300/200',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    coverLeft: 'Left Section',
    coverRight: 'Right Section',
  },
};
