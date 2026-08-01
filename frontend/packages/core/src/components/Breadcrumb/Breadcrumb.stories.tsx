import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from '.';
import type { BreadcrumbProps } from './types';

const sampleItems = [
  { title: 'Home', href: '/' },
  { title: 'Library', href: '/library' },
  { title: 'Data' },
];

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  argTypes: {
    separator: {
      control: 'text',
      description: 'Custom separator between items',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '/' },
      },
    },
    items: {
      control: false,
      description: 'Array of breadcrumb items with title and optional href',
      table: {
        type: { summary: '{ title: string, href?: string }[]' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Breadcrumb component for displaying navigation paths.',
      },
    },
  },
} as Meta<typeof Breadcrumb>;

type Story = StoryObj<typeof Breadcrumb>;

export const InteractiveBreadcrumb = (args: BreadcrumbProps) => (
  <Breadcrumb {...args} />
);

InteractiveBreadcrumb.args = {
  items: sampleItems,
  separator: '/',
};

InteractiveBreadcrumb.argTypes = {
  separator: {
    description: 'Custom separator between items.',
    control: 'text',
  },
  items: {
    description: 'Array of breadcrumb items with title and optional href.',
    control: false,
  },
};

InteractiveBreadcrumb.parameters = {
  docs: {
    staticProps: {
      items: [
        { title: 'Home', href: '/' },
        { title: 'Library', href: '/library' },
        { title: 'Data' },
      ],
      separator: '/',
    },
    liveExample: `function Demo() {
  return (
    <Breadcrumb
      items={[
        { title: 'Home', href: '/' },
        { title: 'Library', href: '/library' },
        { title: 'Data' },
      ]}
      separator="/"
    />
  );
}`,
  },
};

// Keep original for backwards compatibility
export const Default: Story = {
  args: {
    items: sampleItems,
  },
  render: args => <Breadcrumb {...args} />,
};
