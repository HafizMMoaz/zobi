import { render, screen, waitFor } from 'spec/helpers/testing-library';
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
  expect(screen.getByText('Explore')).toBeInTheDocument();
});

/**
 * `spec/helpers/shim.tsx` replaces `react-markdown` app-wide with a
 * passthrough, because its ESM build cannot be parsed under this repo's Jest
 * transform config - so real `<strong>`/`<code>` output is not observable in
 * any test here. This narrows that stand-in to a marked wrapper instead, which
 * still pins down what the fix is about: an assistant answer must reach the
 * Markdown renderer, and a user message must not.
 */
jest.mock('react-markdown', () => (props: { children: string }) => (
  <div data-test="markdown">{props.children}</div>
));

test('an assistant answer is rendered through the Markdown pipeline', async () => {
  render(
    <Harness
      seed={[
        { role: 'user', content: [{ type: 'text', text: 'raw **user** text' }] },
        {
          role: 'assistant',
          content: [{ type: 'text', text: '**bold** and `code`' }],
        },
      ]}
    />,
  );

  // SafeMarkdown imports react-markdown lazily, so this only appears once
  // that dynamic import resolves.
  const rendered = await screen.findByTestId('markdown');
  expect(rendered).toHaveTextContent('**bold** and `code`');
  // The user's own text is shown verbatim, exactly as before.
  expect(screen.getByText('raw **user** text')).not.toBe(rendered);
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

/**
 * `ComposerPrimitive.AddAttachment` opens the file picker by creating a hidden
 * `<input type="file">`, appending it to `document.body` and clicking it. jsdom
 * has no picker, so the test drives that input directly - it is the same
 * element a real click would hand the chosen file to.
 */
async function attachFile(file: File) {
  await userEvent.click(screen.getByRole('button', { name: 'Attach a file' }));
  // eslint-disable-next-line testing-library/no-node-access
  const input = document.body.querySelector<HTMLInputElement>(
    'input[type="file"]',
  )!;
  await userEvent.upload(input, file);
}

test('a file attached in the composer is listed, removable, and sent', async () => {
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);
  (api.fetchTools as jest.Mock).mockResolvedValue([]);
  (api.createConversation as jest.Mock).mockResolvedValue({ id: 11, uuid: 'u' });
  (api.uploadAttachment as jest.Mock).mockImplementation((_id, _file, handlers) => {
    handlers.onDone({
      id: 5,
      uuid: 'u',
      filename: 'data.csv',
      kind: 'csv',
      status: 'ready',
      size_bytes: 3,
      summary: null,
      error: null,
    });
    return () => {};
  });
  (api.deleteAttachment as jest.Mock).mockResolvedValue({});
  (api.streamMessage as jest.Mock).mockImplementation(() => () => {});

  render(<ZobiChat conversationId={null} />);

  await attachFile(new File(['a,b'], 'data.csv', { type: 'text/csv' }));

  // The chip proves the upload is visible before the send, which is what makes
  // a silent paste-upload recoverable.
  expect(await screen.findByText('data.csv')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Remove attachment' }),
  ).toBeInTheDocument();

  await userEvent.type(
    screen.getByPlaceholderText('Send a message...'),
    'summarise this{enter}',
  );

  await waitFor(() =>
    expect(api.streamMessage).toHaveBeenCalledWith(
      11,
      expect.objectContaining({
        content: 'summarise this',
        attachment_ids: [5],
      }),
      expect.any(Function),
      expect.any(Function),
    ),
  );
});

test('removing an attachment takes it off the composer and off the server', async () => {
  (api.fetchModes as jest.Mock).mockResolvedValue([]);
  (api.fetchChatModels as jest.Mock).mockResolvedValue([]);
  (api.fetchTools as jest.Mock).mockResolvedValue([]);
  (api.createConversation as jest.Mock).mockResolvedValue({ id: 12, uuid: 'u' });
  (api.uploadAttachment as jest.Mock).mockImplementation((_id, _file, handlers) => {
    handlers.onDone({
      id: 8,
      uuid: 'u',
      filename: 'notes.pdf',
      kind: 'pdf',
      status: 'ready',
      size_bytes: 3,
      summary: null,
      error: null,
    });
    return () => {};
  });
  (api.deleteAttachment as jest.Mock).mockResolvedValue({});

  render(<ZobiChat conversationId={null} />);

  await attachFile(new File(['x'], 'notes.pdf', { type: 'application/pdf' }));
  await screen.findByText('notes.pdf');

  await userEvent.click(
    screen.getByRole('button', { name: 'Remove attachment' }),
  );

  await waitFor(() => expect(api.deleteAttachment).toHaveBeenCalledWith(8));
  expect(screen.queryByText('notes.pdf')).not.toBeInTheDocument();
});
