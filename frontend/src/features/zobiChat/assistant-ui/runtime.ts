import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import {
  AppendMessage,
  AttachmentAdapter,
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

const APPROVAL_TOOL_NAME = 'request_approval';

/**
 * OpenAI-style tool call arguments arrive as a JSON string. A malformed one
 * would otherwise take the whole transcript down, so it degrades to an empty
 * object and the raw text is kept in `argsText` for display.
 */
const parseToolArgs = (raw: string): Record<string, unknown> => {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

/**
 * Converts a persisted transcript into the same message/part shape a live turn
 * builds, so a reopened conversation renders its tool calls through
 * `ToolActivity`/`ApprovalTool` rather than as raw JSON text.
 *
 * This has to be a whole-array pass rather than a per-message map: the backend
 * stores a tool call and its output as two rows (an assistant row carrying
 * `tool_calls`, then a `role: 'tool'` row carrying the output and the
 * `tool_call_id` it belongs to), whereas assistant-ui wants one tool-call part
 * holding both.
 */
export const toThreadMessages = (
  messages: ChatMessage[],
): ZobiThreadMessage[] => {
  const result: ZobiThreadMessage[] = [];
  const partsById = new Map<string, ZobiToolCallPart>();

  messages.forEach(message => {
    if (message.role === 'tool') {
      const part = message.tool_call_id
        ? partsById.get(message.tool_call_id)
        : undefined;
      if (part) {
        // A row still waiting on the user carries no outcome yet, so leaving
        // `result` unset keeps it rendering as in-flight rather than "Done".
        if (!message.extra?.awaiting_approval) {
          part.result = {
            ok: message.extra?.ok !== false,
            output: message.content ?? '',
          };
        }
        return;
      }
      // No matching call (a truncated history, say). Keep the output visible
      // rather than dropping it.
      if (message.content) {
        result.push({
          role: 'assistant',
          content: [{ type: 'text', text: message.content }],
        });
      }
      return;
    }

    const content: ZobiMessagePart[] = [];
    if (message.content) content.push({ type: 'text', text: message.content });
    message.tool_calls?.forEach(call => {
      const part: ZobiToolCallPart = {
        type: 'tool-call',
        toolCallId: call.id,
        toolName: call.function.name,
        args: parseToolArgs(call.function.arguments),
        argsText: call.function.arguments,
      };
      partsById.set(call.id, part);
      content.push(part);
    });

    result.push({ role: message.role, content });
  });

  return result;
};

export type UseZobiChatRuntimeOptions = {
  conversationId: number | null;
  mode: AgentMode;
  /** Applies to the next send only; the caller resets it via `onSent`. */
  onceModel?: string | null;
  initialMessages: ChatMessage[];
  /** Creates a conversation on first send if one does not exist yet. */
  onConversationStarted: () => Promise<number>;
  /** Called once a send has been issued, so the caller can clear `onceModel`. */
  onSent?: () => void;
  onError: (message: string) => void;
  attachments: AttachmentAdapter;
};

/**
 * Bridges the existing SSE turn protocol (token/tool_start/tool_result/
 * approval_required/error/done) into assistant-ui's ExternalStoreRuntime.
 *
 * One assistant ThreadMessageLike accumulates the whole turn: its text part
 * grows with each `token`, and each `tool_start` appends a tool-call part
 * that `tool_result` (or an approval decision) later fills in with `result`.
 *
 * Loaded history takes a separate path (`toThreadMessages`), since it arrives
 * as persisted rows rather than events, but is converted into the same parts.
 */
export function useZobiChatRuntime({
  conversationId,
  mode,
  onceModel = null,
  initialMessages,
  onConversationStarted,
  onSent,
  onError,
  attachments,
}: UseZobiChatRuntimeOptions) {
  const [messages, setMessages] = useState<ZobiThreadMessage[]>(() =>
    toThreadMessages(initialMessages),
  );
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<(() => void) | null>(null);
  const conversationIdRef = useRef<number | null>(conversationId);
  // Tracks which conversation's history has already been applied, so a
  // non-empty `initialMessages` is seeded in at most once per conversation.
  const appliedInitialMessagesForRef = useRef<number | null>(null);

  // `initialMessages` often arrives after mount - a caller loading an existing
  // conversation fetches its history asynchronously and only then has
  // messages to seed - so the lazy useState initializer above (which only
  // ever runs once) is not enough on its own to pick it up. Gating on
  // `conversationId` (rather than re-applying on every `initialMessages`
  // identity change) keeps this from fighting an in-progress turn's own
  // `setMessages` calls, and from looping if a caller passes a fresh but
  // still-empty array on every render.
  useEffect(() => {
    if (!initialMessages.length) return;
    if (appliedInitialMessagesForRef.current === conversationId) return;
    appliedInitialMessagesForRef.current = conversationId;
    setMessages(toThreadMessages(initialMessages));
  }, [conversationId, initialMessages]);

  // A conversation switch unmounts this hook while its stream may still be
  // open; without this the SSE connection would run to completion with nobody
  // listening.
  useEffect(() => () => abortRef.current?.(), []);

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
      return [
        ...current,
        { role: 'assistant', content: [{ type: 'text', text }] },
      ];
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
      // An attachment-only send is legitimate: assistant-ui's composer builds
      // `content: []` when the draft is empty but files are attached. Anything
      // richer than a single text part is not something this protocol carries.
      if (
        message.content.length > 1 ||
        message.content.some(part => part.type !== 'text')
      ) {
        throw new Error('Only text messages are supported');
      }
      const first = message.content[0];
      // The turn endpoint requires a non-empty body, so a file-only send needs
      // a prompt of its own rather than an empty string.
      const text =
        first?.type === 'text' && first.text
          ? first.text
          : t('Please take a look at the attached files.');
      setMessages(current => [
        ...current,
        { role: 'user', content: [{ type: 'text', text }] },
      ]);

      const targetId =
        conversationIdRef.current ?? (await onConversationStarted());
      conversationIdRef.current = targetId;

      const attachmentIds = message.attachments?.map(a => Number(a.id));

      runTurn(targetId, {
        content: text,
        mode,
        model_alias: onceModel,
        ...(attachmentIds?.length ? { attachment_ids: attachmentIds } : {}),
      });
      // The override applies to this send only; the caller resets it so the
      // next one falls back to the thread's model until the picker is used
      // again.
      onSent?.();
    },
    [mode, onceModel, onConversationStarted, onSent, runTurn],
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
      })
        // Only continue once the backend has actually recorded the decision.
        // Resuming from a failed POST would tell the model an action it never
        // ran was approved - the worst possible answer for a destructive call.
        .then(() => {
          runTurn(targetId, {
            content: approved
              ? t('I approved that action. Please continue.')
              : t('I declined that action. Please suggest something else.'),
            mode,
          });
        })
        .catch(() => {
          upsertToolCall(toolCallId, { result: undefined });
          onError(t('Could not record your decision.'));
        });
    },
    [messages, mode, onError, runTurn, upsertToolCall],
  );

  return useExternalStoreRuntime<ZobiThreadMessage>({
    messages,
    setMessages: newMessages => setMessages([...newMessages]),
    isRunning,
    onNew,
    onCancel,
    onAddToolResult,
    adapters: { attachments },
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
