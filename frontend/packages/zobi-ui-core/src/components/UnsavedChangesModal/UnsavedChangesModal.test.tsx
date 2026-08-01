import { render, screen, userEvent } from '@zobi-ui/core/spec';
import { UnsavedChangesModal } from '.';

test('should render nothing if showModal is false', () => {
  const { queryByRole } = render(
    <UnsavedChangesModal
      showModal={false}
      onHide={() => {}}
      handleSave={() => {}}
      onConfirmNavigation={() => {}}
    />,
  );

  expect(queryByRole('dialog')).not.toBeInTheDocument();
});

test('should render the UnsavedChangesModal component if showModal is true', async () => {
  const { queryByRole } = render(
    <UnsavedChangesModal
      showModal
      onHide={() => {}}
      handleSave={() => {}}
      onConfirmNavigation={() => {}}
    />,
  );

  expect(queryByRole('dialog')).toBeInTheDocument();
});

test('should only call onConfirmNavigation when clicking the Discard button', async () => {
  const mockOnHide = jest.fn();
  const mockHandleSave = jest.fn();
  const mockOnConfirmNavigation = jest.fn();

  render(
    <UnsavedChangesModal
      showModal
      onHide={mockOnHide}
      handleSave={mockHandleSave}
      onConfirmNavigation={mockOnConfirmNavigation}
    />,
  );

  const discardButton: HTMLElement = await screen.findByRole('button', {
    name: /discard/i,
  });

  userEvent.click(discardButton);

  expect(mockOnConfirmNavigation).toHaveBeenCalled();
  expect(mockHandleSave).not.toHaveBeenCalled();
  expect(mockOnHide).not.toHaveBeenCalled();
});

test('should only call handleSave when clicking the Save button', async () => {
  const mockOnHide = jest.fn();
  const mockHandleSave = jest.fn();
  const mockOnConfirmNavigation = jest.fn();

  render(
    <UnsavedChangesModal
      showModal
      onHide={mockOnHide}
      handleSave={mockHandleSave}
      onConfirmNavigation={mockOnConfirmNavigation}
    />,
  );

  const saveButton: HTMLElement = await screen.findByRole('button', {
    name: /save/i,
  });

  userEvent.click(saveButton);

  expect(mockHandleSave).toHaveBeenCalled();
  expect(mockOnHide).not.toHaveBeenCalled();
  expect(mockOnConfirmNavigation).not.toHaveBeenCalled();
});
