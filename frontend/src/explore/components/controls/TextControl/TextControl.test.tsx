import {
  fireEvent,
  render,
  screen,
  userEvent,
} from 'spec/helpers/testing-library';
import TextControl from '.';

const mockedProps = {
  disabled: false,
  isFloat: false,
  isInt: false,
  placeholder: 'Placeholder',
  value: 'Sample value',
};

test('should render', () => {
  const { container } = render(<TextControl {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should render a textbox', () => {
  render(<TextControl {...mockedProps} />);
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

test('should render with initial value', () => {
  render(<TextControl {...mockedProps} />);
  expect(screen.getByDisplayValue('Sample value')).toBeInTheDocument();
});

test('should render with placeholder', () => {
  render(<TextControl {...mockedProps} />);
  expect(screen.getByPlaceholderText('Placeholder')).toBeInTheDocument();
});

test('should render as disabled', () => {
  const disabledProps = {
    ...mockedProps,
    disabled: true,
  };
  render(<TextControl {...disabledProps} />);
  expect(screen.getByPlaceholderText('Placeholder')).toBeDisabled();
});

test('should focus', () => {
  const focusProps = {
    ...mockedProps,
    onFocus: jest.fn(),
  };
  render(<TextControl {...focusProps} />);
  const input = screen.getByPlaceholderText('Placeholder');
  fireEvent.focus(input);
  expect(focusProps.onFocus).toHaveBeenCalledTimes(1);
});

test('should return errors when not a float', async () => {
  const changeProps = {
    ...mockedProps,
    isFloat: true,
    value: null,
    onChange: jest.fn(),
  };
  render(<TextControl {...changeProps} />);
  const input = screen.getByPlaceholderText('Placeholder');
  await userEvent.type(input, '!num', { delay: 500 });
  expect(changeProps.onChange).toHaveBeenCalled();
  expect(changeProps.onChange).toHaveBeenCalledWith('!', [
    'is expected to be a number',
  ]);
});

test('should return errors when not an int', async () => {
  const changeProps = {
    ...mockedProps,
    isInt: true,
    value: null,
    onChange: jest.fn(),
  };
  render(<TextControl {...changeProps} />);
  const input = screen.getByPlaceholderText('Placeholder');
  await userEvent.type(input, '!int', { delay: 500 });
  expect(changeProps.onChange).toHaveBeenCalled();
  expect(changeProps.onChange).toHaveBeenCalledWith('!', [
    'is expected to be an integer',
  ]);
});
