import { act, render, screen, waitFor } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import * as api from 'src/features/zobiChat/api';
import ZobiChatPage from '.';

jest.mock('src/features/zobiChat/api');

/**
 * `SubMenu` styles itself with an `:has()` selector, which jsdom's CSS engine
 * cannot parse - it throws the moment anything on the page calls
 * `getComputedStyle`, which the composer's auto-sizing textarea does on mount.
 * Only its buttons matter here, so this stands in for the rest of it.
 */
jest.mock('src/features/home/SubMenu', () => ({
  __esModule: true,
  default: ({
    buttons = [],
  }: {
    buttons?: { name: unknown; onClick: () => void }[];
  }) => (
    <div>
      {buttons.map((button, index) => (
        <button key={index} type="button" onClick={button.onClick}>
          {button.name as React.ReactNode}
        </button>
      ))}
    </div>
  ),
}));

beforeAll(() => {
  // jsdom has no layout engine, so it does not implement Element.scrollTo; the
  // thread viewport's autoscroll effect calls it on every new message.
  window.HTMLElement.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  (api.fetchConversations as jest.Mock).mockResolvedValue([]);
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);
  (api.fetchTools as jest.Mock).mockResolvedValue([]);
});

/**
 * Regression test for the whole-page wiring, which no component-level test
 * covered: `ZobiChat` reports its new conversation id mid-turn, while the SSE
 * stream that created it is still open. Keying the child on that id tore the
 * streaming instance down at exactly that moment and dropped the answer.
 */
test('keeps streaming the first answer after the new conversation gets its id', async () => {
  let onEvent!: (event: unknown) => void;
  (api.createConversation as jest.Mock).mockResolvedValue({
    id: 42,
    uuid: 'u',
  });
  (api.streamMessage as jest.Mock).mockImplementation((_id, _body, cb) => {
    onEvent = cb;
    return () => {};
  });

  render(<ZobiChatPage />, { useRouter: true, useRedux: true });

  await userEvent.type(
    screen.getByPlaceholderText('Send a message...'),
    'hello{enter}',
  );
  // `createConversation` resolves a tick later, and only then is the stream
  // opened - and `onConversationStarted` fired.
  await waitFor(() => expect(api.streamMessage).toHaveBeenCalled());

  act(() => {
    onEvent({ type: 'token', text: 'Sure, here is the answer.' });
    onEvent({ type: 'done' });
  });

  expect(
    await screen.findByText('Sure, here is the answer.'),
  ).toBeInTheDocument();
  // The thread was never re-fetched: the transcript on screen is the live one.
  expect(api.fetchConversation).not.toHaveBeenCalled();
});

test('switching to another thread loads it and drops the previous stream', async () => {
  const abort = jest.fn();
  let onEvent!: (event: unknown) => void;
  (api.fetchConversations as jest.Mock).mockResolvedValue([
    {
      id: 8,
      uuid: 'u8',
      title: 'Older chat',
      mode: 'manual',
      model_alias: null,
    },
  ]);
  (api.fetchConversation as jest.Mock).mockResolvedValue({
    id: 8,
    uuid: 'u8',
    title: 'Older chat',
    mode: 'manual',
    model_alias: null,
    messages: [{ role: 'assistant', content: 'Welcome back' }],
  });
  (api.createConversation as jest.Mock).mockResolvedValue({
    id: 42,
    uuid: 'u',
  });
  (api.streamMessage as jest.Mock).mockImplementation((_id, _body, cb) => {
    onEvent = cb;
    return abort;
  });

  render(<ZobiChatPage />, { useRouter: true, useRedux: true });

  await userEvent.type(
    screen.getByPlaceholderText('Send a message...'),
    'hello{enter}',
  );
  await waitFor(() => expect(api.streamMessage).toHaveBeenCalled());
  act(() => onEvent({ type: 'token', text: 'partial answer' }));
  expect(await screen.findByText('partial answer')).toBeInTheDocument();

  await userEvent.click(await screen.findByText('Older chat'));

  expect(await screen.findByText('Welcome back')).toBeInTheDocument();
  expect(screen.queryByText('partial answer')).not.toBeInTheDocument();
  // The orphaned SSE connection is closed rather than left running.
  expect(abort).toHaveBeenCalled();
});

test('"New chat" clears the transcript even though the id is unchanged', async () => {
  let onEvent!: (event: unknown) => void;
  (api.createConversation as jest.Mock).mockResolvedValue({
    id: 42,
    uuid: 'u',
  });
  (api.streamMessage as jest.Mock).mockImplementation((_id, _body, cb) => {
    onEvent = cb;
    return () => {};
  });

  render(<ZobiChatPage />, { useRouter: true, useRedux: true });

  await userEvent.type(
    screen.getByPlaceholderText('Send a message...'),
    'hello{enter}',
  );
  await waitFor(() => expect(api.streamMessage).toHaveBeenCalled());
  act(() => onEvent({ type: 'token', text: 'an answer' }));
  expect(await screen.findByText('an answer')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /new chat/i }));

  // A plain `selected` key would not have changed here (42 -> null -> ...),
  // so the remount has to be driven separately.
  await waitFor(() =>
    expect(screen.queryByText('an answer')).not.toBeInTheDocument(),
  );
});
