import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import { AssistantRuntimeProvider, useExternalStoreRuntime } from '@assistant-ui/react';
import { useState } from 'react';
import * as api from '../api';
import Thread from './Thread';
import ZobiChat from './ZobiChat';

jest.mock('../api');

function Harness({ seed = [] }: { seed?: readonly any[] }) {
  const [messages, setMessages] = useState<readonly any[]>(seed);
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

/**
 * These two cover the registration point rather than `ToolActivity` itself:
 * a tool-call part whose name was never registered as a tool (every Zobi tool
 * is backend-executed, so none are) has to reach `components.tools.Fallback`
 * on `MessagePrimitive.Parts`, and `request_approval` has to be filtered out
 * there so Task 10's dedicated renderer owns it.
 */
test('an unregistered tool call renders through the fallback renderer', async () => {
  render(
    <Harness
      seed={[
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId: 'call-1',
              toolName: 'run_query',
              args: { sql: 'select 1' },
              argsText: '{"sql":"select 1"}',
              result: { ok: true, output: '1 row' },
            },
          ],
        },
      ]}
    />,
  );

  expect(await screen.findByText('run_query')).toBeInTheDocument();
  expect(screen.getByText('Done')).toBeInTheDocument();
  expect(screen.getByText('1 row')).toBeInTheDocument();
});

test('a request_approval tool call is left to its own renderer', async () => {
  render(
    <Harness
      seed={[
        {
          role: 'assistant',
          content: [
            { type: 'text', text: 'thinking' },
            {
              type: 'tool-call',
              toolCallId: 'call-2',
              toolName: 'request_approval',
              args: { name: 'drop_table' },
              argsText: '',
            },
          ],
        },
      ]}
    />,
  );

  expect(await screen.findByText('thinking')).toBeInTheDocument();
  expect(screen.queryByText('request_approval')).not.toBeInTheDocument();
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

/**
 * Minimal fakes for the two browser recording APIs `VoiceInput` drives.
 * Nothing in this repo's jsdom setup stubs `getUserMedia`/`MediaRecorder`
 * yet, so this test provides its own: `start()` delivers one data chunk and
 * stops asynchronously (a real `setTimeout`, not React state) so it lands
 * after `VoiceInput`'s own `setState('recording')` rather than racing it.
 */
class FakeMediaRecorder {
  static isTypeSupported = (): boolean => true;

  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  state: 'inactive' | 'recording' = 'inactive';
  mimeType = 'audio/webm';

  start(): void {
    this.state = 'recording';
    setTimeout(() => {
      this.ondataavailable?.({ data: new Blob(['audio']) });
      this.state = 'inactive';
      this.onstop?.();
    }, 0);
  }

  stop(): void {
    this.state = 'inactive';
    this.onstop?.();
  }
}

test('a completed voice transcription is appended to the composer text', async () => {
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);
  (api.fetchTools as jest.Mock).mockResolvedValue([]);
  (api.transcribeAudio as jest.Mock).mockResolvedValue({
    text: 'show me sales',
    language: 'en',
    backend: 'whisper',
  });

  Object.defineProperty(window.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [] }) },
  });
  window.MediaRecorder = FakeMediaRecorder as unknown as typeof MediaRecorder;

  render(<ZobiChat conversationId={null} />);

  await userEvent.click(screen.getByRole('button', { name: /record a voice message/i }));
  // VoiceInput's own recording UI is out of scope here; this only asserts the
  // transcription lands in the composer once it resolves.
  expect(await screen.findByDisplayValue('show me sales')).toBeInTheDocument();
});
