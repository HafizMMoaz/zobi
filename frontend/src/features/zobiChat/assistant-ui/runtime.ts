import { useCallback, useRef, useState } from 'react';
import {
  AppendMessage,
  ThreadMessageLike,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import { respondToApproval, streamMessage } from '../api';
import { AgentMode, ChatMessage, StreamEvent } from '../types';

/** A message part representing a chunk of streamed assistant text. */
type ZobiTextPart = { type: 'text'; text: string };

/**
 * One tool invocation, from the moment it starts until its result (or an
 * approval decision) arrives. `request_approval` calls reuse this same shape,
 * with the approval's own name/title/risk/description/arguments nested under
 * `args` (see the `approval_required` branch in `runTurn` below).
 */
export type ZobiToolCallPart = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  argsText: string;
  result?: { ok: boolean; output?: string; approved?: boolean };
};

type ZobiMessagePart = ZobiTextPart | ZobiToolCallPart;

/**
 * This hook's own message shape: a `ThreadMessageLike` whose `content` is
 * always our narrow part union, never assistant-ui's broader (and partly
 * string-typed) one. Keeping state in this shape lets every handler below
 * treat `content` as a plain array with no extra narrowing; `convertMessage`
 * is the one place that bridges out to `ThreadMessageLike` for the runtime.
 */
type ZobiThreadMessage = {
  role: 'user' | 'assistant' | 'system';
  content: ZobiMessagePart[];
};

const toThreadMessage = (message: ChatMessage): ZobiThreadMessage => ({
  role: message.role === 'tool' ? 'assistant' : message.role,
  content: message.content ? [{ type: 'text', text: message.content }] : [],
});

const APPROVAL_TOOL_NAME = 'request_approval';

export type UseZobiChatRuntimeOptions = {
  conversationId: number | null;
  mode: AgentMode;
  initialMessages: ChatMessage[];
  /** Creates a conversation on first send if one does not exist yet. */
  onConversationStarted: () => Promise<number>;
  onError: (message: string) => void;
};

/**
 * Bridges the existing SSE turn protocol (token/tool_start/tool_result/
 * approval_required/error/done) into assistant-ui's ExternalStoreRuntime.
 *
 * One assistant ThreadMessageLike accumulates the whole turn: its text part
 * grows with each `token`, and each `tool_start` appends a tool-call part
 * that `tool_result` (or an approval decision) later fills in with `result`.
 */
export function useZobiChatRuntime({
  conversationId,
  mode,
  initialMessages,
  onConversationStarted,
  onError,
}: UseZobiChatRuntimeOptions) {
  const [messages, setMessages] = useState<ZobiThreadMessage[]>(() =>
    initialMessages.map(toThreadMessage),
  );
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<(() => void) | null>(null);
  const conversationIdRef = useRef<number | null>(conversationId);

  const appendAssistantText = useCallback((text: string) => {
    setMessages(current => {
      const last = current[current.length - 1];
      if (last?.role === 'assistant') {
        const parts = last.content.slice();
        const textPart = parts.find(
          (part): part is ZobiTextPart => part.type === 'text',
        );
        if (textPart) {
          textPart.text += text;
          return [...current.slice(0, -1), { ...last, content: parts }];
        }
        return [
          ...current.slice(0, -1),
          { ...last, content: [...parts, { type: 'text', text }] },
        ];
      }
      return [...current, { role: 'assistant', content: [{ type: 'text', text }] }];
    });
  }, []);

  const upsertToolCall = useCallback(
    (toolCallId: string, patch: Partial<ZobiToolCallPart>) => {
      setMessages(current => {
        const last = current[current.length - 1];
        const newPart: ZobiToolCallPart = {
          type: 'tool-call',
          toolCallId,
          // Guaranteed by every call site that can create a fresh entry
          // (tool_start, approval_required): both always pass toolName.
          toolName: patch.toolName as string,
          args: patch.args ?? {},
          argsText: patch.argsText ?? JSON.stringify(patch.args ?? {}),
          ...patch,
        };
        // A tool call can be the first event of a turn, arriving before any
        // `token`, so there may not be an assistant message to attach it to
        // yet; start one, the same way appendAssistantText does for text.
        if (!last || last.role !== 'assistant') {
          return [...current, { role: 'assistant', content: [newPart] }];
        }
        const parts = last.content.slice();
        const index = parts.findIndex(
          part => part.type === 'tool-call' && part.toolCallId === toolCallId,
        );
        if (index === -1) {
          parts.push(newPart);
        } else {
          // findIndex's predicate above already confirmed this slot holds a
          // tool-call part, so the merge below stays within ZobiToolCallPart.
          parts[index] = { ...parts[index], ...patch } as ZobiToolCallPart;
        }
        return [...current.slice(0, -1), { ...last, content: parts }];
      });
    },
    [],
  );

  const runTurn = useCallback(
    (targetId: number, body: Parameters<typeof streamMessage>[1]) => {
      setIsRunning(true);
      abortRef.current = streamMessage(
        targetId,
        body,
        (event: StreamEvent) => {
          switch (event.type) {
            case 'token':
              appendAssistantText(event.text);
              break;
            case 'tool_start':
              upsertToolCall(event.id, {
                toolName: event.name,
                args: event.arguments,
                argsText: JSON.stringify(event.arguments),
              });
              break;
            case 'tool_result':
              upsertToolCall(event.id, {
                result: { ok: event.ok, output: event.output },
              });
              break;
            case 'approval_required':
              upsertToolCall(event.id, {
                toolName: APPROVAL_TOOL_NAME,
                args: {
                  name: event.name,
                  title: event.title,
                  risk: event.risk,
                  description: event.description,
                  arguments: event.arguments,
                },
                argsText: '',
              });
              setIsRunning(false);
              break;
            case 'error':
              onError(event.message);
              setIsRunning(false);
              break;
            case 'done':
              setIsRunning(false);
              break;
            default:
              break;
          }
        },
        message => {
          onError(message);
          setIsRunning(false);
        },
      );
    },
    [appendAssistantText, upsertToolCall, onError],
  );

  const onNew = useCallback(
    async (message: AppendMessage) => {
      if (message.content.length !== 1 || message.content[0]?.type !== 'text') {
        throw new Error('Only text messages are supported');
      }
      const text = message.content[0].text;
      setMessages(current => [
        ...current,
        { role: 'user', content: [{ type: 'text', text }] },
      ]);

      const targetId = conversationIdRef.current ?? (await onConversationStarted());
      conversationIdRef.current = targetId;

      runTurn(targetId, { content: text, mode });
    },
    [mode, onConversationStarted, runTurn],
  );

  const onCancel = useCallback(async () => {
    abortRef.current?.();
    setIsRunning(false);
  }, []);

  const onAddToolResult = useCallback(
    ({ toolCallId, result }: { toolCallId: string; result: unknown }) => {
      const approved = (result as { approved: boolean }).approved;
      const targetId = conversationIdRef.current;
      if (!targetId) return;

      upsertToolCall(toolCallId, {
        result: result as ZobiToolCallPart['result'],
      });

      const part = messages
        .flatMap(m => m.content)
        .find(
          (p): p is ZobiToolCallPart =>
            p.type === 'tool-call' && p.toolCallId === toolCallId,
        );
      if (!part) return;

      // `part.args` is Record<string, unknown> at the type level, but for a
      // request_approval part (the only kind onAddToolResult ever settles)
      // it was built with exactly this shape in the approval_required branch
      // above.
      const approvalArgs = part.args as {
        name: string;
        arguments: Record<string, unknown>;
      };

      respondToApproval(targetId, {
        tool_call_id: toolCallId,
        tool_name: approvalArgs.name,
        arguments: approvalArgs.arguments,
        approved,
      }).finally(() => {
        runTurn(targetId, {
          content: approved
            ? 'I approved that action. Please continue.'
            : 'I declined that action. Please suggest something else.',
          mode,
        });
      });
    },
    [messages, mode, runTurn, upsertToolCall],
  );

  return useExternalStoreRuntime<ZobiThreadMessage>({
    messages,
    setMessages: newMessages => setMessages([...newMessages]),
    isRunning,
    onNew,
    onCancel,
    onAddToolResult,
    // ZobiThreadMessage's content is a narrower, stricter view of the same
    // shape ThreadMessageLike's content union accepts (e.g. `args` here is
    // Record<string, unknown> rather than ReadonlyJSONObject) - safe at
    // runtime since every part we build only ever holds JSON-safe values,
    // but not nominally identical, hence the bridge cast.
    convertMessage: (message: ZobiThreadMessage): ThreadMessageLike => ({
      role: message.role,
      content: message.content as unknown as ThreadMessageLike['content'],
    }),
  });
}
