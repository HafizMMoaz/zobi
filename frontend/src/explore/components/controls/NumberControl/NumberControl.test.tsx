import { render, screen, userEvent } from 'spec/helpers/testing-library';
import NumberControl from '.';

const mockedProps = {
  min: -5,
  max: 10,
  step: 1,
  default: 0,
};

test('render', () => {
  const { container } = render(<NumberControl {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('type number and blur triggers onChange', async () => {
  const props = {
    ...mockedProps,
    onChange: jest.fn(),
  };
  render(<NumberControl {...props} />);
  const input = screen.getByRole('spinbutton');
  userEvent.type(input, '9');
  userEvent.tab(); // Trigger blur to dispatch
  expect(props.onChange).toHaveBeenLastCalledWith(9);
});

test('type value exceeding max and blur', async () => {
  const props = {
    ...mockedProps,
    onChange: jest.fn(),
  };
  render(<NumberControl {...props} />);
  const input = screen.getByRole('spinbutton');
  userEvent.type(input, '20');
  userEvent.tab(); // Trigger blur to dispatch
  expect(props.onChange).toHaveBeenCalled();
});

test('type NaN keeps original value', async () => {
  const props = {
    ...mockedProps,
    value: 5,
    onChange: jest.fn(),
  };
  render(<NumberControl {...props} />);
  const input = screen.getByRole('spinbutton');
  userEvent.type(input, 'not a number');
  userEvent.tab(); // Trigger blur

  expect(props.onChange).toHaveBeenLastCalledWith(5);
});

test('can clear field completely', async () => {
  const props = {
    ...mockedProps,
    value: 10,
    onChange: jest.fn(),
  };
  render(<NumberControl {...props} />);
  const input = screen.getByRole('spinbutton');
  userEvent.clear(input);
  userEvent.tab(); // Trigger blur
  expect(props.onChange).toHaveBeenLastCalledWith(undefined);
});

test('stepper arrows trigger onChange immediately', async () => {
  const props = {
    ...mockedProps,
    value: 5,
    onChange: jest.fn(),
  };
  render(<NumberControl {...props} />);
  const upButton = document.querySelector(
    '.ant-input-number-handler-up',
  ) as HTMLElement;
  expect(upButton).toBeInTheDocument();
  await userEvent.click(upButton);
  expect(props.onChange).toHaveBeenCalledWith(6);
});

test('updates local value when prop changes', () => {
  const props = {
    ...mockedProps,
    value: 5,
    onChange: jest.fn(),
  };
  const { rerender } = render(<NumberControl {...props} />);
  const input = screen.getByRole('spinbutton');
  expect(input).toHaveValue('5');

  rerender(<NumberControl {...props} value={8} />);
  expect(input).toHaveValue('8');
});
