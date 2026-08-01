import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { Form } from '@zobi-ui/core/components';
import BasicInfoSection from './BasicInfoSection';

const defaultProps = {
  form: {
    getFieldValue: jest.fn(() => 'Test Dashboard'),
  } as any,
  validationStatus: {
    basic: { hasErrors: false, errors: [], name: 'Basic' },
  },
};

test('renders name and slug fields', () => {
  render(
    <Form>
      <BasicInfoSection {...defaultProps} />
    </Form>,
  );

  expect(screen.getByTestId('dashboard-name-field')).toBeInTheDocument();
  expect(screen.getByTestId('dashboard-slug-field')).toBeInTheDocument();
  expect(screen.getByTestId('dashboard-title-input')).toBeInTheDocument();
});

test('shows required asterisk for name field', () => {
  render(
    <Form>
      <BasicInfoSection {...defaultProps} />
    </Form>,
  );

  expect(screen.getByText('*')).toBeInTheDocument();
});

test('shows error message when name is empty and has validation errors', () => {
  const mockForm = {
    getFieldValue: jest.fn(field => (field === 'title' ? '' : 'test')),
  };

  const validationStatus = {
    basic: {
      hasErrors: true,
      errors: ['Dashboard name is required'],
      name: 'Basic',
    },
  };

  render(
    <Form>
      <BasicInfoSection
        {...defaultProps}
        form={mockForm as any}
        validationStatus={validationStatus}
      />
    </Form>,
  );

  expect(screen.getByText('Dashboard name is required')).toBeInTheDocument();
});

test('does not show error when name is provided', () => {
  const mockForm = {
    getFieldValue: jest.fn(() => 'Test Dashboard'),
  };

  const validationStatus = {
    basic: { hasErrors: true, errors: [], name: 'Basic' },
  };

  render(
    <Form>
      <BasicInfoSection
        {...defaultProps}
        form={mockForm as any}
        validationStatus={validationStatus}
      />
    </Form>,
  );

  expect(
    screen.queryByText('Dashboard name is required'),
  ).not.toBeInTheDocument();
});

test('can type in name field', async () => {
  render(
    <Form>
      <BasicInfoSection {...defaultProps} />
    </Form>,
  );

  const nameInput = screen.getByTestId('dashboard-title-input');
  await userEvent.type(nameInput, 'My Dashboard');

  expect(nameInput).toHaveValue('My Dashboard');
});
