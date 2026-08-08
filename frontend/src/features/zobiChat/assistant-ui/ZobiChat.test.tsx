import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import * as api from '../api';
import ZobiChat from './ZobiChat';

jest.mock('../api');

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
