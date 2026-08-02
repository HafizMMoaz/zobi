import { render, screen, act } from 'spec/helpers/testing-library';
import { zobiTheme } from '@zobi.dev/extension-api/theme';
import { getStatusConfig, StatusIndicatorDot } from './StatusIndicatorDot';
import { AutoRefreshStatus } from '../../types/autoRefresh';

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('renders with success status', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Success} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Success);
});

test('renders with fetching status', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Fetching} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Fetching);
});

test('renders with delayed status', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Delayed} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Delayed);
});

test('renders with idle status', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Idle} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Idle);
});

test('renders with error status', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Error} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Error);
});

test('renders with paused status', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Paused} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Paused);
});

test('uses the icon color for the paused status outline', () => {
  expect(getStatusConfig(zobiTheme, AutoRefreshStatus.Paused)).toMatchObject({
    needsBorder: true,
    outlineColor: 'currentColor',
  });
});

test('has correct accessibility attributes', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Success} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('role', 'status');
  expect(dot).toHaveAttribute('aria-label', 'Auto-refresh status: success');
});

test('fetching status updates immediately without debounce', () => {
  jest.useFakeTimers();

  const { rerender } = render(
    <StatusIndicatorDot status={AutoRefreshStatus.Success} />,
  );

  // Change to fetching - should be immediate
  rerender(<StatusIndicatorDot status={AutoRefreshStatus.Fetching} />);

  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Fetching);
});

test('debounces non-fetching status changes to prevent flickering', () => {
  jest.useFakeTimers();

  const { rerender } = render(
    <StatusIndicatorDot status={AutoRefreshStatus.Success} />,
  );

  // Change to error - should be debounced
  rerender(<StatusIndicatorDot status={AutoRefreshStatus.Error} />);

  // Status should still show success (debounced)
  let dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Success);

  // Fast forward past debounce time (100ms)
  act(() => {
    jest.advanceTimersByTime(150);
  });

  // Now should be error
  dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-status', AutoRefreshStatus.Error);
});

test('accepts custom size prop', () => {
  render(<StatusIndicatorDot status={AutoRefreshStatus.Success} size={16} />);
  const dot = screen.getByTestId('status-indicator-dot');
  expect(dot).toHaveAttribute('data-size', '16');
});
