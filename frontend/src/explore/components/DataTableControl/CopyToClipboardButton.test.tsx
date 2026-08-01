import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import { CopyToClipboardButton } from '.';

test('Render a button', () => {
  render(<CopyToClipboardButton data={[{ copy: 'data', data: 'copy' }]} />, {
    useRedux: true,
  });
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('Should copy to clipboard', async () => {
  const callback = jest.fn();
  document.execCommand = callback;

  const originalClipboard = { ...global.navigator.clipboard };
  // @ts-expect-error
  global.navigator.clipboard = { write: callback, writeText: callback };

  render(<CopyToClipboardButton data={[{ copy: 'data', data: 'copy' }]} />, {
    useRedux: true,
  });

  expect(callback).toHaveBeenCalledTimes(0);
  userEvent.click(screen.getByRole('button'));

  await waitFor(() => {
    expect(callback).toHaveBeenCalled();
  });

  jest.resetAllMocks();
  // @ts-expect-error
  global.navigator.clipboard = originalClipboard;
});

test('Should not copy to clipboard when disabled', async () => {
  const callback = jest.fn();
  document.execCommand = callback;

  const originalClipboard = { ...global.navigator.clipboard };
  // @ts-expect-error
  global.navigator.clipboard = { write: callback, writeText: callback };

  render(
    <CopyToClipboardButton data={[{ copy: 'data', data: 'copy' }]} disabled />,
    {
      useRedux: true,
    },
  );

  const copyButton = screen.getByRole('button');
  expect(copyButton).toHaveAttribute('aria-disabled', 'true');
  userEvent.click(copyButton);

  await waitFor(() => {
    expect(callback).not.toHaveBeenCalled();
  });

  jest.resetAllMocks();
  // @ts-expect-error
  global.navigator.clipboard = originalClipboard;
});
