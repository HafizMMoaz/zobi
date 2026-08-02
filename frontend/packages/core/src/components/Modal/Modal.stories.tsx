import { Button } from '../Button';
import { Modal } from './Modal';
import type { ModalProps, ModalFuncProps } from './types';

export default {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    docs: {
      description: {
        component:
          'Modal dialog component for displaying content that requires user attention or interaction. Supports customizable buttons, drag/resize, and confirmation dialogs.',
      },
    },
  },
};

export const InteractiveModal = (props: ModalProps) => (
  <Modal {...props}>Hi</Modal>
);

InteractiveModal.args = {
  disablePrimaryButton: false,
  primaryButtonName: 'Submit',
  primaryButtonStyle: 'primary',
  show: false,
  title: "I'm a modal!",
  resizable: false,
  draggable: false,
  width: 500,
};

InteractiveModal.argTypes = {
  show: {
    control: 'boolean',
    description:
      'Whether the modal is visible. Use the "Try It" example below for a working demo.',
  },
  title: {
    control: 'text',
    description: 'Title displayed in the modal header.',
  },
  primaryButtonName: {
    control: 'text',
    description: 'Text for the primary action button.',
  },
  primaryButtonStyle: {
    control: 'select',
    options: ['primary', 'secondary', 'dashed', 'danger', 'link'],
    description: 'The style of the primary action button.',
  },
  width: {
    control: 'number',
    description: 'Width of the modal in pixels.',
  },
  resizable: {
    control: 'boolean',
    description: 'Whether the modal can be resized by dragging corners.',
  },
  draggable: {
    control: 'boolean',
    description: 'Whether the modal can be dragged by its header.',
  },
  disablePrimaryButton: {
    control: 'boolean',
    description: 'Whether the primary button is disabled.',
  },
  onHandledPrimaryAction: { action: 'onHandledPrimaryAction' },
  onHide: { action: 'onHide' },
};

InteractiveModal.parameters = {
  docs: {
    triggerProp: 'show',
    onHideProp: 'onHide',
    liveExample: `function ModalDemo() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        show={isOpen}
        onHide={() => setIsOpen(false)}
        title="Example Modal"
        primaryButtonName="Submit"
        onHandledPrimaryAction={() => {
          alert('Submitted!');
          setIsOpen(false);
        }}
      >
        <p>This is the modal content. Click Submit or close the modal.</p>
      </Modal>
    </>
  );
}`,
    examples: [
      {
        title: 'Danger Modal',
        code: `function DangerModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button buttonStyle="danger" onClick={() => setIsOpen(true)}>Delete Item</Button>
      <Modal
        show={isOpen}
        onHide={() => setIsOpen(false)}
        title="Confirm Delete"
        primaryButtonName="Delete"
        primaryButtonStyle="danger"
        onHandledPrimaryAction={() => {
          alert('Deleted!');
          setIsOpen(false);
        }}
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </Modal>
    </>
  );
}`,
      },
      {
        title: 'Confirmation Dialogs',
        code: `function ConfirmationDialogs() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={() => Modal.confirm({
        title: 'Confirm Action',
        content: 'Are you sure you want to proceed?',
        okText: 'Yes',
      })}>Confirm</Button>
      <Button onClick={() => Modal.warning({
        title: 'Warning',
        content: 'This action may have consequences.',
      })}>Warning</Button>
      <Button onClick={() => Modal.error({
        title: 'Error',
        content: 'Something went wrong.',
      })}>Error</Button>
    </div>
  );
}`,
      },
    ],
  },
};

export const ModalFunctions = (props: ModalFuncProps) => (
  <div>
    <Button onClick={() => Modal.error(props)}>Error</Button>
    <Button onClick={() => Modal.warning(props)}>Warning</Button>
    <Button onClick={() => Modal.confirm(props)}>Confirm</Button>
  </div>
);

ModalFunctions.args = {
  title: 'Modal title',
  content: 'Modal content',
  keyboard: true,
  okText: 'Test',
  maskClosable: true,
  mask: true,
};
