import { act, render, screen, waitFor, within } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import * as api from '../api';
import ZobiChat from './ZobiChat';

jest.mock('../api');

// None of these tests exercise the slash palette, but ZobiChat always fetches
// the tool list on mount, so it needs a default resolved value here.
beforeEach(() => {
  (api.fetchTools as jest.Mock).mockResolvedValue([]);
});

// jsdom has no layout engine, so it doesn't implement Element.scrollTo; the
// thread viewport's autoscroll effect calls it on every new message, which
// throws as an unhandled rejection inside jsdom's rAF loop and fails
// whichever test happens to still be running when that callback fires.
beforeAll(() => {
  window.HTMLElement.prototype.scrollTo = jest.fn();
});

test('creates a conversation on first send and reports it back', async () => {
  (api.createConversation as jest.Mock).mockResolvedValue({ id: 42, uuid: 'u' });
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);
  (api.streamMessage as jest.Mock).mockImplementation((_id, _body, _onEvent, _onError) => () => {});

  const onConversationStarted = jest.fn();
  render(<ZobiChat conversationId={null} onConversationStarted={onConversationStarted} />);

  await userEvent.type(screen.getByPlaceholderText('Send a message...'), 'hi{enter}');

  expect(api.createConversation).toHaveBeenCalledWith('manual');
  expect(onConversationStarted).toHaveBeenCalledWith(42);
});

test('loads an existing conversation history', async () => {
  (api.fetchConversation as jest.Mock).mockResolvedValue({
    id: 7,
    uuid: 'u',
    title: null,
    mode: 'manual',
    model_alias: null,
    messages: [{ role: 'assistant', content: 'Welcome back' }],
  });
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);

  render(<ZobiChat conversationId={7} />);

  expect(await screen.findByText('Welcome back')).toBeInTheDocument();
});

test('switching the model persists it and applies to the next send', async () => {
  (api.fetchModes as jest.Mock).mockResolvedValue([
    { value: 'manual', label: 'Ask before changes', description: '' },
  ]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([
    { alias: 'fast', is_default: false },
    { alias: 'gpt-4o', is_default: true },
  ]);
  (api.createConversation as jest.Mock).mockResolvedValue({ id: 9, uuid: 'u' });
  (api.updateConversation as jest.Mock).mockResolvedValue({});
  (api.streamMessage as jest.Mock).mockImplementation(() => () => {});

  render(<ZobiChat conversationId={null} />);

  await userEvent.click(
    await screen.findByRole('button', { name: 'Switch mode and model' }),
  );
  // "fast" appears in both the thread-model and once-model sections, so scope
  // to the thread-model group (the one that persists rather than the one
  // that applies to only the next send).
  const modelGroup = await screen.findByRole('group', { name: 'Model' });
  await userEvent.click(
    within(modelGroup).getByRole('menuitemradio', { name: 'fast' }),
  );

  await userEvent.type(screen.getByPlaceholderText('Send a message...'), 'hi{enter}');

  expect(api.streamMessage).toHaveBeenCalledWith(
    9,
    expect.objectContaining({ model_alias: null }),
    expect.any(Function),
    expect.any(Function),
  );
  // `fast` was set as the thread model (persisted), not a once-only override,
  // so model_alias on the send body is null and the thread's model was PUT.
  expect(api.updateConversation).toHaveBeenCalledWith(9, { model_alias: 'fast' });
});

test('an approval_required event renders ApprovalTool, and approving resumes the turn', async () => {
  let onEvent!: (event: unknown) => void;
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);
  (api.streamMessage as jest.Mock).mockImplementation((_id, _body, cb) => {
    onEvent = cb;
    return () => {};
  });
  (api.respondToApproval as jest.Mock).mockResolvedValue({ ok: true, output: 'done' });
  (api.createConversation as jest.Mock).mockResolvedValue({ id: 3, uuid: 'u' });

  render(<ZobiChat conversationId={null} />);
  await userEvent.type(screen.getByPlaceholderText('Send a message...'), 'drop orders{enter}');
  // `createConversation` resolves asynchronously, so `streamMessage` (and
  // therefore `onEvent`) is only wired up a tick after `userEvent.type`
  // settles - wait for it rather than racing it.
  await waitFor(() => expect(api.streamMessage).toHaveBeenCalled());

  act(() => {
    onEvent({
      type: 'approval_required',
      id: 'call-9',
      name: 'drop_table',
      title: 'Drop table',
      risk: 'destructive',
      description: 'Deletes a table permanently.',
      arguments: { table: 'orders' },
    });
  });

  await userEvent.click(await screen.findByRole('button', { name: 'Approve' }));

  expect(api.respondToApproval).toHaveBeenCalledWith(3, {
    tool_call_id: 'call-9',
    tool_name: 'drop_table',
    arguments: { table: 'orders' },
    approved: true,
  });
});
