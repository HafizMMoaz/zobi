import { action } from '@storybook/addon-actions';
import { Meta, StoryFn } from '@storybook/react';
import type { LabelType } from './types';
import { Label, DatasetTypeLabel, PublishedLabel } from '.';

// Define the default export with Storybook configuration
export default {
  title: 'Components/Label',
  component: Label,
  excludeStories: ['options'],
} as Meta<typeof Label>;

// Explicitly type the options array as an array of `Type`
export const options: LabelType[] = [
  'default',
  'info',
  'success',
  'warning',
  'error',
  'primary',
];

// Define the props for the `LabelGallery` component
interface LabelGalleryProps {
  hasOnClick?: boolean;
  monospace?: boolean;
}

// Use the `StoryFn` type for LabelGallery
export const LabelGallery: StoryFn<LabelGalleryProps> = (
  props: LabelGalleryProps,
) => {
  const onClick = props.hasOnClick ? action('clicked') : undefined;

  return (
    <>
      <h4>Non-interactive</h4>
      {options.map((opt: LabelType) => (
        <Label key={opt} type={opt}>
          {`style: "${opt}"`}
        </Label>
      ))}
      <br />
      <h4>Interactive</h4>
      {options.map((opt: LabelType) => (
        <Label key={opt} type={opt} {...props} onClick={onClick}>
          {`style: "${opt}"`}
        </Label>
      ))}
      <h4>Reusable Labels</h4>
      <h5>DatasetType</h5>
      <div>
        <DatasetTypeLabel datasetType="physical" />
        <DatasetTypeLabel datasetType="virtual" />
      </div>
      <h5>PublishedLabel</h5>
      <PublishedLabel isPublished />
      <PublishedLabel isPublished={false} />
    </>
  );
};

// Define default arguments for Storybook
LabelGallery.args = {
  hasOnClick: true,
  monospace: false,
};

// Define argument types for Storybook controls
LabelGallery.argTypes = {
  monospace: {
    name: 'monospace',
    control: { type: 'boolean' },
  },
  hasOnClick: {
    name: 'hasOnClick',
    control: { type: 'boolean' },
  },
};

// Interactive single Label story
interface InteractiveLabelProps {
  type: LabelType;
  children: string;
  monospace?: boolean;
}

export const InteractiveLabel: StoryFn<InteractiveLabelProps> = args => (
  <Label {...args}>{args.children}</Label>
);

InteractiveLabel.args = {
  type: 'default',
  children: 'Label text',
  monospace: false,
};

InteractiveLabel.argTypes = {
  type: {
    description: 'The visual style of the label.',
    options,
    control: { type: 'select' },
  },
  children: {
    description: 'The label text content.',
    control: { type: 'text' },
  },
  monospace: {
    description: 'Use monospace font.',
    control: { type: 'boolean' },
  },
};
