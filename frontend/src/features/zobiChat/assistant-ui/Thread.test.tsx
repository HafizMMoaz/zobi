import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import { AssistantRuntimeProvider, useExternalStoreRuntime } from '@assistant-ui/react';
import { useState } from 'react';
import Thread from './Thread';

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
