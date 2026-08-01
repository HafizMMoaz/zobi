import { Meta, StoryObj } from '@storybook/react';
import { IconButton } from '.';

export default {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          'The IconButton component is a versatile button that allows you to combine an icon with a text label. It is designed for use in situations where you want to display an icon along with some text in a single clickable element.',
      },
      a11y: {
        enabled: true,
      },
    },
  },
} as Meta<typeof IconButton>;

type Story = StoryObj<typeof IconButton>;

export const InteractiveIconButton: Story = {
  args: {
    buttonText: 'IconButton',
    altText: 'Icon button alt text',
    padded: true,
    icon: 'https://zobi.dev/img/zobi-logo-horiz.svg',
  },
  argTypes: {
    altText: {
      control: 'text',
      description:
        'The alt text for the button. If not provided, the button text is used as the alt text by default.',
      table: {
        type: { summary: 'string' },
      },
    },
    buttonText: {
      control: 'text',
      description: 'The text inside the button.',
      table: {
        type: { summary: 'string' },
      },
    },
    icon: {
      control: 'text',
      description: 'Icon inside the button (URL or path).',
      table: {
        type: { summary: 'string' },
      },
    },
    padded: {
      control: 'boolean',
      description: 'Add padding between icon and button text.',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'A button with an icon and text label.',
      },
      liveExample: `function Demo() {
  return (
    <IconButton
      buttonText="Zobi"
      icon="https://zobi.dev/img/zobi-logo-horiz.svg"
      padded
      onClick={() => alert('Clicked!')}
    />
  );
}`,
    },
  },
};

export const Default: Story = {
  args: {
    buttonText: 'Default IconButton',
  },
};

export const CustomIcon: Story = {
  args: {
    buttonText: 'Custom icon IconButton',
    icon: 'https://zobi.dev/img/zobi-logo-horiz.svg',
  },
};
