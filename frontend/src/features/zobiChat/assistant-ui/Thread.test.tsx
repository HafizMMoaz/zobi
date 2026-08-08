import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import { AssistantRuntimeProvider, useExternalStoreRuntime } from '@assistant-ui/react';
import { useState } from 'react';
import * as api from '../api';
import Thread from './Thread';
import ZobiChat from './ZobiChat';

jest.mock('../api');

function Harness() {
  const [messages, setMessages] = useState<readonly any[]>([]);
  const runtime = useExternalStoreRuntime({
    messages,
    setMessages,
    convertMessage: (message: any) => message,
    onNew: async message => {
      setMessages(current => [
        ...current,
        { role: 'user', content: message.content },
        { role: 'assistant', content: [{ type: 'text', text: 'ack' }] },
      ]);
    },
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}

test('sends a typed message and renders the reply', async () => {
  render(<Harness />);
  const input = screen.getByPlaceholderText('Send a message...');
  await userEvent.type(input, 'hello{enter}');

  expect(await screen.findByText('ack')).toBeInTheDocument();
});

test('shows welcome suggestions before any message is sent', () => {
  render(<Harness />);
  expect(screen.getByText('Weather')).toBeInTheDocument();
});

test('typing "/" opens the slash palette and selecting a tool fills the composer', async () => {
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);
  (api.fetchTools as jest.Mock).mockResolvedValue([
    { name: 'list_tables', title: 'List tables', risk: 'read', description: 'Lists tables.' },
  ]);

  render(<ZobiChat conversationId={null} />);

  const input = screen.getByPlaceholderText('Send a message...');
  await userEvent.type(input, '/list');

  expect(await screen.findByText('List tables')).toBeInTheDocument();
  await userEvent.click(screen.getByText('List tables'));

  expect(input).toHaveValue('/list_tables ');
});
