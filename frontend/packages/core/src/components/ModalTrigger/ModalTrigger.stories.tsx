import { ModalTrigger } from '.';

interface IModalTriggerProps {
  triggerNode: JSX.Element;
  dialogClassName?: string;
  modalTitle?: string;
  modalBody?: JSX.Element;
  modalFooter?: JSX.Element;
  beforeOpen?: () => void;
  onExit?: () => void;
  isButton?: boolean;
  className?: string;
  tooltip?: string;
  width?: string;
  maxWidth?: string;
  responsive?: boolean;
  draggable?: boolean;
  resizable?: boolean;
}

export default {
  title: 'Components/ModalTrigger',
  component: ModalTrigger,
  parameters: {
    docs: {
      description: {
        component:
          'A component that renders a trigger element which opens a modal when clicked. Useful for actions that need confirmation or additional input.',
      },
    },
  },
};

export const InteractiveModalTrigger = (args: IModalTriggerProps) => (
  <ModalTrigger {...args} triggerNode={<span>Click me</span>} />
);

InteractiveModalTrigger.args = {
  isButton: true,
  modalTitle: 'Modal Title',
  modalBody: 'This is the modal body content.',
  tooltip: 'Click to open modal',
  width: '600px',
  maxWidth: '1000px',
  responsive: true,
  draggable: false,
  resizable: false,
};

InteractiveModalTrigger.argTypes = {
  triggerNode: {
    control: false,
    description: 'The clickable element that opens the modal when clicked.',
  },
  isButton: {
    control: 'boolean',
    description: 'Whether to wrap the trigger in a button element.',
  },
  modalTitle: {
    control: 'text',
    description: 'Title displayed in the modal header.',
  },
  modalBody: {
    control: 'text',
    description: 'Content displayed in the modal body.',
  },
  tooltip: {
    control: 'text',
    description: 'Tooltip text shown on hover over the trigger.',
  },
  width: {
    control: 'text',
    description: 'Width of the modal (e.g., "600px", "80%").',
  },
  maxWidth: {
    control: 'text',
    description: 'Maximum width of the modal.',
  },
  responsive: {
    control: 'boolean',
    description: 'Whether the modal should be responsive.',
  },
  draggable: {
    control: 'boolean',
    description: 'Whether the modal can be dragged by its header.',
  },
  resizable: {
    control: 'boolean',
    description: 'Whether the modal can be resized by dragging corners.',
  },
};

InteractiveModalTrigger.parameters = {
  docs: {
    // Use a simple span for triggerNode since isButton: true wraps it in a button
    staticProps: {
      triggerNode: 'Click to Open Modal',
    },
    liveExample: `function Demo() {
  return (
    <ModalTrigger
      isButton
      triggerNode={<span>Click to Open</span>}
      modalTitle="Example Modal"
      modalBody={<p>This is the modal content. You can put any React elements here.</p>}
      width="500px"
      responsive
    />
  );
}`,
    examples: [
      {
        title: 'With Custom Trigger',
        code: `function CustomTrigger() {
  return (
    <ModalTrigger
      triggerNode={
        <Button buttonStyle="primary">
          <Icons.PlusOutlined /> Add New Item
        </Button>
      }
      modalTitle="Add New Item"
      modalBody={
        <div>
          <p>Fill out the form to add a new item.</p>
          <Input placeholder="Item name" />
        </div>
      }
      width="400px"
    />
  );
}`,
      },
      {
        title: 'Draggable & Resizable',
        code: `function DraggableModal() {
  return (
    <ModalTrigger
      isButton
      triggerNode={<span>Open Draggable Modal</span>}
      modalTitle="Draggable & Resizable"
      modalBody={<p>Try dragging the header or resizing from the corners!</p>}
      draggable
      resizable
      width="500px"
    />
  );
}`,
      },
    ],
  },
};
