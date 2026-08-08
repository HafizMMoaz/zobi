import { renderHook, act } from '@testing-library/react';
import { useZobiChatRuntime } from './runtime';
import * as api from '../api';

jest.mock('../api');

const mockStreamMessage = api.streamMessage as jest.Mock;

const stubAttachmentAdapter = {
  accept: '',
  add: jest.fn(),
  send: jest.fn(),
  remove: jest.fn(),
};

function setup(
  overrides: Partial<Parameters<typeof useZobiChatRuntime>[0]> = {},
) {
  const onConversationStarted = jest.fn().mockResolvedValue(1);
  const onError = jest.fn();
  const { result } = renderHook(() =>
    useZobiChatRuntime({
      conversationId: 1,
      mode: 'manual',
      initialMessages: [],
      onConversationStarted,
      onError,
      attachments: stubAttachmentAdapter,
      ...overrides,
    }),
  );
  return { result, onConversationStarted, onError };
}

test('appends a streaming assistant message token by token', async () => {
  let capturedHandlers: {
    onEvent: (event: unknown) => void;
    onError: (message: string) => void;
  } | null = null;
  mockStreamMessage.mockImplementation((_id, _body, onEvent, onErr) => {
    capturedHandlers = { onEvent, onError: onErr };
    return () => {};
  });

  const { result } = setup();
  const runtime = result.current;

  await act(async () => {
    await runtime.thread.append({
      role: 'user',
      content: [{ type: 'text', text: 'hello' }],
    });
  });

  expect(mockStreamMessage).toHaveBeenCalledWith(
    1,
    expect.objectContaining({ content: 'hello', mode: 'manual' }),
    expect.any(Function),
    expect.any(Function),
  );

  act(() => {
    capturedHandlers!.onEvent({ type: 'token', text: 'Hi' });
    capturedHandlers!.onEvent({ type: 'token', text: ' there' });
  });

  const messages = runtime.thread.getState().messages;
  const last = messages[messages.length - 1];
  expect(last.role).toBe('assistant');
  expect(last.content).toEqual([{ type: 'text', text: 'Hi there' }]);
});

test('turns tool_start/tool_result events into a tool-call part', async () => {
  let onEvent!: (event: unknown) => void;
  mockStreamMessage.mockImplementation((_id, _body, cb) => {
    onEvent = cb;
    return () => {};
  });
  const { result } = setup();

  await act(async () => {
    await result.current.thread.append({
      role: 'user',
      content: [{ type: 'text', text: 'list tables' }],
    });
  });

  act(() => {
    onEvent({
      type: 'tool_start',
      id: 'call-1',
      name: 'list_tables',
      title: 'List tables',
      risk: 'read',
      arguments: {},
    });
  });
  let last = result.current.thread.getState().messages.at(-1)!;
  expect(last.content).toContainEqual(
    expect.objectContaining({
      type: 'tool-call',
      toolCallId: 'call-1',
      toolName: 'list_tables',
    }),
  );

  act(() => {
    onEvent({
      type: 'tool_result',
      id: 'call-1',
      name: 'list_tables',
      ok: true,
      output: 'orders, users',
    });
  });
  last = result.current.thread.getState().messages.at(-1)!;
  expect(last.content).toContainEqual(
    expect.objectContaining({
      toolCallId: 'call-1',
      result: { ok: true, output: 'orders, users' },
    }),
  );
});

test('approval_required stops the run and surfaces a request_approval tool-call', async () => {
  let onEvent!: (event: unknown) => void;
  mockStreamMessage.mockImplementation((_id, _body, cb) => {
    onEvent = cb;
    return () => {};
  });
  const { result } = setup();

  await act(async () => {
    await result.current.thread.append({
      role: 'user',
      content: [{ type: 'text', text: 'delete the orders table' }],
    });
  });

  act(() => {
    onEvent({
      type: 'approval_required',
      id: 'call-2',
      name: 'drop_table',
      title: 'Drop table',
      risk: 'destructive',
      description: 'Deletes a table permanently.',
      arguments: { table: 'orders' },
    });
  });

  expect(result.current.thread.getState().isRunning).toBe(false);
  const last = result.current.thread.getState().messages.at(-1)!;
  expect(last.content).toContainEqual(
    expect.objectContaining({
      toolCallId: 'call-2',
      toolName: 'request_approval',
    }),
  );
});

test('a send with completed attachments includes their ids in the stream body', async () => {
  mockStreamMessage.mockImplementation(() => () => {});
  const { result } = setup();

  await act(async () => {
    await result.current.thread.append({
      role: 'user',
      content: [{ type: 'text', text: 'summarise this' }],
      attachments: [
        {
          id: '5',
          type: 'document',
          name: 'data.csv',
          content: [],
          status: { type: 'complete' },
        },
      ],
    });
  });

  expect(mockStreamMessage).toHaveBeenCalledWith(
    1,
    expect.objectContaining({ content: 'summarise this', attachment_ids: [5] }),
    expect.any(Function),
    expect.any(Function),
  );
});

test('a send with no attachments omits attachment_ids from the stream body', async () => {
  mockStreamMessage.mockImplementation(() => () => {});
  const { result } = setup();

  await act(async () => {
    await result.current.thread.append({
      role: 'user',
      content: [{ type: 'text', text: 'hi' }],
    });
  });

  const [, body] = mockStreamMessage.mock.calls.at(-1)!;
  expect(body).not.toHaveProperty('attachment_ids');
});

test('a file-only send is accepted rather than rejected as unsupported', async () => {
  mockStreamMessage.mockImplementation(() => () => {});
  const { result } = setup();

  await act(async () => {
    await result.current.thread.append({
      role: 'user',
      // What assistant-ui's composer builds when the draft is empty but a
      // file is attached.
      content: [],
      attachments: [
        {
          id: '7',
          type: 'document',
          name: 'data.csv',
          content: [],
          status: { type: 'complete' },
        },
      ],
    });
  });

  const [, body] = mockStreamMessage.mock.calls.at(-1)!;
  expect(body.content).toBeTruthy();
  expect(body.attachment_ids).toEqual([7]);
});

test('historical tool calls become tool-call parts, not raw text', () => {
  const { result } = setup({
    initialMessages: [
      { role: 'user', content: 'which tables are there?' },
      {
        role: 'assistant',
        content: 'Let me check.',
        tool_calls: [
          {
            id: 'call-1',
            type: 'function',
            function: { name: 'list_tables', arguments: '{"schema":"public"}' },
          },
        ],
      },
      {
        role: 'tool',
        content: 'orders, users',
        tool_call_id: 'call-1',
        tool_name: 'list_tables',
        extra: { ok: true },
      },
    ],
  });

  const [, assistant] = result.current.thread.getState().messages;
  expect(assistant.content).toEqual([
    { type: 'text', text: 'Let me check.' },
    expect.objectContaining({
      type: 'tool-call',
      toolCallId: 'call-1',
      toolName: 'list_tables',
      args: { schema: 'public' },
      result: { ok: true, output: 'orders, users' },
    }),
  ]);
  // The `tool` row was folded into the call above rather than becoming its own
  // assistant bubble.
  expect(result.current.thread.getState().messages).toHaveLength(2);
});

test('a failed historical tool call keeps its failure', () => {
  const { result } = setup({
    initialMessages: [
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call-2',
            type: 'function',
            // Malformed arguments must not take the transcript down with them.
            function: { name: 'run_query', arguments: 'not json' },
          },
        ],
      },
      {
        role: 'tool',
        content: 'syntax error',
        tool_call_id: 'call-2',
        extra: { ok: false },
      },
    ],
  });

  const [assistant] = result.current.thread.getState().messages;
  expect(assistant.content).toEqual([
    expect.objectContaining({
      toolName: 'run_query',
      args: {},
      argsText: 'not json',
      result: { ok: false, output: 'syntax error' },
    }),
  ]);
});

test('unmounting aborts an in-flight stream', async () => {
  const abort = jest.fn();
  mockStreamMessage.mockImplementation(() => abort);
  const onConversationStarted = jest.fn().mockResolvedValue(1);
  const { result, unmount } = renderHook(() =>
    useZobiChatRuntime({
      conversationId: 1,
      mode: 'manual',
      initialMessages: [],
      onConversationStarted,
      onError: jest.fn(),
      attachments: stubAttachmentAdapter,
    }),
  );

  await act(async () => {
    await result.current.thread.append({
      role: 'user',
      content: [{ type: 'text', text: 'hello' }],
    });
  });

  unmount();
  expect(abort).toHaveBeenCalled();
});
