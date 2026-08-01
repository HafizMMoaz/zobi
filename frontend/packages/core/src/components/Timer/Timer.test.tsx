import { render, waitFor } from '@zobi.dev/core/spec';
import { Timer, TimerProps } from '.';
import { now } from '../../utils/dates';

function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

function parseTime(text?: string | null) {
  return !!text && Number(text.replace(/:/g, ''));
}

describe('Timer', () => {
  const mockProps: TimerProps = {
    startTime: now(),
    endTime: undefined,
    isRunning: true,
    status: 'warning',
  };

  test('should render correctly', async () => {
    const screen = render(<Timer {...mockProps} />);
    const node = screen.getByRole('timer');
    let text = node.textContent || '';
    expect(node).toBeInTheDocument();
    expect(node).toHaveTextContent('00:00:00.00');
    // should start running
    await waitFor(() => {
      expect(parseTime(screen.getByRole('timer')?.textContent)).toBeGreaterThan(
        0.2,
      );
    });
    text = node.textContent || '';

    // should stop
    screen.rerender(<Timer {...mockProps} isRunning={false} />);
    // the same node should still be in DOM and the content should not change
    expect(screen.getByRole('timer')).toBe(node);
    expect(node).toHaveTextContent(text.trim());

    // the timestamp should not change even after while
    await sleep(100);
    expect(screen.getByRole('timer')).toBe(node);
    expect(node).toHaveTextContent(text.trim());

    // should continue and start from stopped time
    screen.rerender(<Timer {...mockProps} isRunning />);
    expect(screen.getByRole('timer')).toBe(node);
    expect(node).toHaveTextContent(text.trim());

    await waitFor(() => {
      expect(screen.getByRole('timer')).toBe(node);
      expect(parseTime(node.textContent)).toBeGreaterThan(0.3);
    });

    // should restart from start
    screen.rerender(<Timer {...mockProps} startTime={now()} />);
    await waitFor(() => {
      expect(parseTime(node.textContent)).toBeLessThan(0.1);
    });
    // should continue to run
    await waitFor(() => {
      expect(parseTime(node.textContent)).toBeGreaterThan(0.3);
    });
  });
});
