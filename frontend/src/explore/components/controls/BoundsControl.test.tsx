import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import BoundsControl from 'src/explore/components/controls/BoundsControl';

const defaultProps = {
  name: 'y_axis_bounds',
  label: 'Bounds of the y axis',
  onChange: jest.fn(),
};

test('renders two inputs', () => {
  render(<BoundsControl {...defaultProps} />);
  expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
});

test('receives null on non-numeric', async () => {
  render(<BoundsControl {...defaultProps} />);
  const minInput = screen.getAllByRole('spinbutton')[0];
  userEvent.type(minInput, '1');
  userEvent.clear(minInput);
  await waitFor(() =>
    expect(defaultProps.onChange).toHaveBeenCalledWith([null, null]),
  );
});

test('calls onChange with correct values', async () => {
  render(<BoundsControl {...defaultProps} />);
  const minInput = screen.getAllByRole('spinbutton')[0];
  const maxInput = screen.getAllByRole('spinbutton')[1];
  userEvent.type(minInput, '1');
  userEvent.type(maxInput, '2');
  await waitFor(() =>
    expect(defaultProps.onChange).toHaveBeenLastCalledWith([1, 2]),
  );
});

test('receives 0 value', async () => {
  render(<BoundsControl {...defaultProps} />);
  const minInput = screen.getAllByRole('spinbutton')[0];
  userEvent.type(minInput, '0');
  await waitFor(() =>
    expect(defaultProps.onChange).toHaveBeenLastCalledWith([0, null]),
  );
});
