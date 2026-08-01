
import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from '@zobi-ui/core/spec';
import type { FormModalProps } from './types';
import { FormItem } from '../Form';
import { Input } from '../Input';
import { FormModal } from './FormModal';

describe('FormModal Component', () => {
  const children = (
    <>
      <FormItem
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input placeholder="Enter your name" aria-label="Name" />
      </FormItem>
      <FormItem name="email" label="Email">
        <Input placeholder="Enter your email" aria-label="Email" />
      </FormItem>
    </>
  );

  const mockedProps: FormModalProps = {
    show: true,
    onHide: jest.fn(),
    title: 'Test Form Modal',
    onSave: jest.fn(),
    formSubmitHandler: jest.fn().mockResolvedValue(undefined),
    initialValues: { name: '', email: '' },
    requiredFields: ['name'],
    children,
  };

  const renderComponent = () => render(<FormModal {...mockedProps} />);

  test('should render the modal with two input fields', () => {
    renderComponent();

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  test('should disable Save button when required fields are empty', async () => {
    renderComponent();

    const saveButton = screen.getByTestId('form-modal-save-button');
    expect(saveButton).toBeDisabled();
  });

  test('should enable Save button only when the required field is filled', async () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter your name');
    await userEvent.type(nameInput, 'Jane Doe');

    await waitFor(() => {
      expect(screen.getByTestId('form-modal-save-button')).toBeEnabled();
    });
  });

  test('should keep Save button disabled when only the optional field is filled', async () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    await userEvent.type(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(screen.getByTestId('form-modal-save-button')).toBeDisabled();
    });
  });

  test('should call formSubmitHandler with correct values when submitted', async () => {
    renderComponent();

    await userEvent.type(
      screen.getByPlaceholderText('Enter your name'),
      'Jane Doe',
    );
    await userEvent.type(
      screen.getByPlaceholderText('Enter your email'),
      'test@example.com',
    );

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockedProps.formSubmitHandler).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'test@example.com',
      });
      expect(mockedProps.onSave).toHaveBeenCalled();
    });
  });
});
