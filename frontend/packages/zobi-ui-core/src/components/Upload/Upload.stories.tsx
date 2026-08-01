import type { StoryObj } from '@storybook/react';
import { Icons } from '../Icons';
import { Button } from '../Button';
import { Upload } from '.';

export default {
  title: 'Components/Upload',
  component: Upload,
  parameters: {
    docs: {
      description: {
        component:
          'Upload component for file selection and uploading. ' +
          'Supports drag-and-drop, multiple files, and different list display styles.',
      },
    },
  },
};

type Story = StoryObj<typeof Upload>;

export const Default: Story = {
  render: args => (
    <Upload {...args}>
      {args.listType !== 'picture-card' &&
      args.listType !== 'picture-circle' ? (
        <Button icon={<Icons.UploadOutlined iconColor="light" iconSize="l" />}>
          Click to Upload
        </Button>
      ) : (
        'Click to Upload'
      )}
    </Upload>
  ),
};

export const InteractiveUpload = (args: any) => <Upload {...args} />;

InteractiveUpload.args = {
  multiple: false,
  disabled: false,
  listType: 'text',
  showUploadList: true,
};

InteractiveUpload.argTypes = {
  multiple: {
    control: { type: 'boolean' },
    description: 'Support multiple file selection.',
  },
  disabled: {
    control: { type: 'boolean' },
    description: 'Disable the upload button.',
  },
  listType: {
    control: { type: 'select' },
    options: ['text', 'picture', 'picture-card', 'picture-circle'],
    description: 'Built-in style for the file list display.',
  },
  showUploadList: {
    control: { type: 'boolean' },
    description: 'Whether to show the upload file list.',
  },
};

InteractiveUpload.parameters = {
  docs: {
    sampleChildren: [
      {
        component: 'Button',
        props: { children: 'Click to Upload' },
      },
    ],
    liveExample: `function Demo() {
  return (
    <Upload>
      <Button>Click to Upload</Button>
    </Upload>
  );
}`,
    examples: [
      {
        title: 'Picture Card Style',
        code: `function PictureCard() {
  return (
    <Upload listType="picture-card">
      + Upload
    </Upload>
  );
}`,
      },
      {
        title: 'Drag and Drop',
        code: `function DragDrop() {
  return (
    <Upload.Dragger>
      <p style={{ fontSize: 48, color: '#999', margin: 0 }}>+</p>
      <p>Click or drag file to this area to upload</p>
      <p style={{ color: '#999' }}>Support for single or bulk upload.</p>
    </Upload.Dragger>
  );
}`,
      },
    ],
  },
};
