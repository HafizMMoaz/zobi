import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import { CopyToClipboard } from '.';

test('renders with default props', () => {
  const text = 'Text';
  render(<CopyToClipboard text={text} />, { useRedux: true });
  expect(screen.getByText(text)).toBeInTheDocument();
  expect(screen.getByText('Copy')).toBeInTheDocument();
});

test('renders with custom copy node', () => {
  const copyNode = <a href="/">Custom node</a>;
  render(<CopyToClipboard copyNode={copyNode} />, { useRedux: true });
  expect(screen.getByRole('link')).toBeInTheDocument();
});

test('renders without text showing', () => {
  const text = 'Text';
  render(<CopyToClipboard text={text} shouldShowText={false} />, {
    useRedux: true,
  });
  expect(screen.queryByText(text)).not.toBeInTheDocument();
});

test('getText on copy', async () => {
  const getText = jest.fn(() => 'Text');
  render(<CopyToClipboard getText={getText} />, { useRedux: true });
  userEvent.click(screen.getByText('Copy'));
  await waitFor(() => expect(getText).toHaveBeenCalled());
});

test('renders tooltip on hover', async () => {
  const tooltipText = 'Tooltip';
  render(<CopyToClipboard tooltipText={tooltipText} />, { useRedux: true });
  userEvent.hover(screen.getByText('Copy'));
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip).toHaveTextContent(tooltipText);
});

test('not renders tooltip on hover with hideTooltip props', async () => {
  const tooltipText = 'Tooltip';
  render(<CopyToClipboard tooltipText={tooltipText} hideTooltip />, {
    useRedux: true,
  });
  userEvent.hover(screen.getByText('Copy'));
  const tooltip = screen.queryByRole('tooltip');
  expect(tooltip).not.toBeInTheDocument();
});

test('triggers onCopyEnd', async () => {
  const onCopyEnd = jest.fn();
  render(<CopyToClipboard onCopyEnd={onCopyEnd} />, {
    useRedux: true,
  });
  userEvent.click(screen.getByText('Copy'));
  await waitFor(() => expect(onCopyEnd).toHaveBeenCalled());
});

test('does not copy when disabled', async () => {
  const callback = jest.fn();
  document.execCommand = callback;

  const originalClipboard = { ...global.navigator.clipboard };
  // @ts-expect-error
  global.navigator.clipboard = { write: callback, writeText: callback };

  render(<CopyToClipboard disabled text="Text" />, { useRedux: true });

  const copyButton = screen.getByText('Copy');
  expect(copyButton).toHaveAttribute('aria-disabled', 'true');

  userEvent.click(copyButton);

  await waitFor(() => {
    expect(callback).not.toHaveBeenCalled();
  });

  jest.resetAllMocks();
  // @ts-expect-error
  global.navigator.clipboard = originalClipboard;
});

test('renders unwrapped', () => {
  const text = 'Text';
  render(<CopyToClipboard text={text} wrapped={false} />, {
    useRedux: true,
  });
  expect(screen.queryByText(text)).not.toBeInTheDocument();
});
