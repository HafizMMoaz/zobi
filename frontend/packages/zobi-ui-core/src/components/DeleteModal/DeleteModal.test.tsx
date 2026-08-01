import { render, screen, userEvent, waitFor } from '@zobi-ui/core/spec';
import { DeleteModal } from '.';

test('Must display title and content', () => {
  const props = {
    title: <div data-test="test-title">Title</div>,
    description: <div data-test="test-description">Description</div>,
    onConfirm: jest.fn(),
    onHide: jest.fn(),
    open: true,
  };
  render(<DeleteModal {...props} />);
  expect(screen.getByTestId('test-title')).toBeInTheDocument();
  expect(screen.getByTestId('test-description')).toBeInTheDocument();
});

test('Input should autofocus when modal opens', async () => {
  const props = {
    title: <div data-test="test-title">Title</div>,
    description: <div data-test="test-description">Description</div>,
    onConfirm: jest.fn(),
    onHide: jest.fn(),
    open: true,
  };
  render(<DeleteModal {...props} />);
  const input = screen.getByTestId('delete-modal-input');
  // waitFor because focus may happen after render due to useEffect
  await waitFor(() => {
    expect(input).toHaveFocus();
  });
});

test('Calling "onHide"', async () => {
  const props = {
    title: <div data-test="test-title">Title</div>,
    description: <div data-test="test-description">Description</div>,
    onConfirm: jest.fn(),
    onHide: jest.fn(),
    open: true,
  };
  const modal = <DeleteModal {...props} />;
  render(modal);
  expect(props.onHide).toHaveBeenCalledTimes(0);
  expect(props.onConfirm).toHaveBeenCalledTimes(0);

  // type "del" in the input
  userEvent.type(screen.getByTestId('delete-modal-input'), 'del');
  expect(screen.getByTestId('delete-modal-input')).toHaveValue('del');

  // close the modal
  expect(screen.getByTestId('close-modal-btn')).toBeInTheDocument();
  userEvent.click(screen.getByTestId('close-modal-btn'));
  expect(props.onHide).toHaveBeenCalledTimes(1);
  expect(props.onConfirm).toHaveBeenCalledTimes(0);

  // confirm input has been cleared
  expect(screen.getByTestId('delete-modal-input')).toHaveValue('');
});

test('Calling "onConfirm" only after typing "delete" in the input', async () => {
  const props = {
    title: <div data-test="test-title">Title</div>,
    description: <div data-test="test-description">Description</div>,
    onConfirm: jest.fn(),
    onHide: jest.fn(),
    open: true,
  };
  render(<DeleteModal {...props} />);
  expect(props.onHide).toHaveBeenCalledTimes(0);
  expect(props.onConfirm).toHaveBeenCalledTimes(0);
  expect(screen.getByTestId('delete-modal-input')).toBeInTheDocument();
  expect(props.onConfirm).toHaveBeenCalledTimes(0);

  // do not execute "onConfirm" if you have not typed "delete"
  await userEvent.click(screen.getByText('Delete'));
  expect(props.onConfirm).toHaveBeenCalledTimes(0);

  // execute "onConfirm" if you have typed "delete"
  await userEvent.type(screen.getByTestId('delete-modal-input'), 'delete');
  await userEvent.click(screen.getByText('Delete'));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);

  // confirm input has been cleared
  expect(screen.getByTestId('delete-modal-input')).toHaveValue('');
});
