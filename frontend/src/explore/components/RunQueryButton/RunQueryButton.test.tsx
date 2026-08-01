
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { RunQueryButton } from './index';

const createProps = (overrides: Record<string, any> = {}) => ({
  loading: false,
  onQuery: jest.fn(),
  onStop: jest.fn(),
  errorMessage: null,
  isNewChart: false,
  canStopQuery: true,
  chartIsStale: true,
  ...overrides,
});

test('renders update chart button', () => {
  const props = createProps();
  render(<RunQueryButton {...props} />);
  expect(screen.getByText('Update chart')).toBeVisible();
  userEvent.click(screen.getByRole('button'));
  expect(props.onQuery).toHaveBeenCalled();
});

test('renders create chart button', () => {
  const props = createProps({ isNewChart: true });
  render(<RunQueryButton {...props} />);
  expect(screen.getByText('Create chart')).toBeVisible();
  userEvent.click(screen.getByRole('button'));
  expect(props.onQuery).toHaveBeenCalled();
});

test('renders disabled button', () => {
  const props = createProps({ errorMessage: 'error' });
  render(<RunQueryButton {...props} />);
  expect(screen.getByText('Update chart')).toBeVisible();
  expect(screen.getByRole('button')).toBeDisabled();
  userEvent.click(screen.getByRole('button'));
  expect(props.onQuery).not.toHaveBeenCalled();
});

test('renders query running button', () => {
  const props = createProps({ loading: true });
  render(<RunQueryButton {...props} />);
  expect(screen.getByText('Stop')).toBeVisible();
  userEvent.click(screen.getByRole('button'));
  expect(props.onStop).toHaveBeenCalled();
});

test('renders query running button disabled', () => {
  const props = createProps({ loading: true, canStopQuery: false });
  render(<RunQueryButton {...props} />);
  expect(screen.getByText('Stop')).toBeVisible();
  expect(screen.getByRole('button')).toBeDisabled();
  userEvent.click(screen.getByRole('button'));
  expect(props.onStop).not.toHaveBeenCalled();
});
