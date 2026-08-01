import { fireEvent, render, screen } from 'spec/helpers/testing-library';
import { Input } from '@zobi.dev/core/components';

import Field from '.';

const defaultProps = {
  fieldKey: 'mock',
  value: '',
  label: 'mock',
  description: 'description',
  control: <Input data-test="mock-text-control" />,
  onChange: jest.fn(),
  compact: false,
  inline: false,
  additionalControl: (
    <input type="button" data-test="mock-text-aditional-control" />
  ),
};

test('should render', () => {
  const { container } = render(<Field {...defaultProps} />);
  expect(container).toBeInTheDocument();
});
test('should render with aditional control', () => {
  const { getByTestId } = render(<Field {...defaultProps} />);
  const additionalControl = getByTestId('mock-text-aditional-control');
  expect(additionalControl).toBeInTheDocument();
});
test('should call onChange', () => {
  const { getByTestId } = render(<Field {...defaultProps} />);
  const textArea = getByTestId('mock-text-control');
  fireEvent.change(textArea, { target: { value: 'x' } });
  expect(defaultProps.onChange).toHaveBeenCalled();
});

test('should render compact', () => {
  render(<Field {...defaultProps} compact />);
  expect(screen.queryByText(defaultProps.description)).not.toBeInTheDocument();
});
test('shiuld render error message', () => {
  const { getByText } = render(
    <Field {...defaultProps} errorMessage="error message" />,
  );
  expect(getByText('error message')).toBeInTheDocument();
});
