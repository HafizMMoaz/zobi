import { render, screen } from 'spec/helpers/testing-library';
import { Input } from '@zobi-ui/core/components';
import { ModalFormField } from './ModalFormField';

test('renders field with label and input', () => {
  render(
    <ModalFormField label="Test Field">
      <Input placeholder="Test input" />
    </ModalFormField>,
  );

  expect(screen.getByText('Test Field')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
});

test('shows required asterisk when required is true', () => {
  render(
    <ModalFormField label="Required Field" required>
      <Input />
    </ModalFormField>,
  );

  expect(screen.getByText('Required Field')).toBeInTheDocument();
  const asterisk = screen.getByText('*');
  expect(asterisk).toBeInTheDocument();
  expect(asterisk).toHaveClass('required'); // Should have required class
});

test('shows red asterisk when required field has error', () => {
  render(
    <ModalFormField label="Required Field" required error="Field is required">
      <Input />
    </ModalFormField>,
  );

  const asterisk = screen.getByText('*');
  expect(asterisk).toBeInTheDocument();
  expect(asterisk).toHaveClass('required'); // Should have required class (always red now)
});

test('renders helper text when provided', () => {
  render(
    <ModalFormField label="Field" helperText="This is helpful">
      <Input />
    </ModalFormField>,
  );

  expect(screen.getByText('This is helpful')).toBeInTheDocument();
});

test('renders error message when provided', () => {
  render(
    <ModalFormField label="Field" error="This field is invalid">
      <Input />
    </ModalFormField>,
  );

  expect(screen.getByText('This field is invalid')).toBeInTheDocument();
});

test('renders tooltip when provided', () => {
  const tooltip = <div>Tooltip content</div>;
  render(
    <ModalFormField label="Field" tooltip={tooltip}>
      <Input />
    </ModalFormField>,
  );

  // Tooltip is rendered inside InfoTooltip component
  expect(screen.getByTestId('info-tooltip-icon')).toBeInTheDocument();
});

test('applies bottomSpacing by default', () => {
  const { container } = render(
    <ModalFormField label="Field">
      <Input />
    </ModalFormField>,
  );

  const fieldContainer = container.firstChild;
  expect(fieldContainer).toHaveStyle('margin-bottom: 16px'); // theme.sizeUnit * 4
});

test('removes bottomSpacing when bottomSpacing is false', () => {
  const { container } = render(
    <ModalFormField label="Field" bottomSpacing={false}>
      <Input />
    </ModalFormField>,
  );

  const fieldContainer = container.firstChild;
  expect(fieldContainer).toHaveStyle('margin-bottom: 0px');
});

test('applies testId to container', () => {
  render(
    <ModalFormField label="Field" testId="custom-field">
      <Input />
    </ModalFormField>,
  );

  expect(screen.getByTestId('custom-field')).toBeInTheDocument();
});

test('renders both helper text and error message', () => {
  render(
    <ModalFormField
      label="Field"
      helperText="Helper text"
      error="Error message"
    >
      <Input />
    </ModalFormField>,
  );

  expect(screen.getByText('Helper text')).toBeInTheDocument();
  expect(screen.getByText('Error message')).toBeInTheDocument();
});
