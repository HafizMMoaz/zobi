import { useCallback, useRef, useState } from 'react';
import {
  AppendMessage,
  ThreadMessageLike,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import { respondToApproval, streamMessage } from '../api';
import { AgentMode, ChatMessage, StreamEvent } from '../types';

const toThreadMessage = (message: ChatMessage): ThreadMessageLike => ({
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
  const [messages, setMessages] = useState<ThreadMessageLike[]>(() =>
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
        const textPart = parts.find(part => part.type === 'text');
        if (textPart && textPart.type === 'text') {
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
    (toolCallId: string, patch: Partial<Record<string, unknown>>) => {
      setMessages(current => {
        const last = current[current.length - 1];
        const newPart = {
          type: 'tool-call' as const,
          toolCallId,
          toolName: patch.toolName as string,
          args: (patch.args as Record<string, unknown>) ?? {},
          argsText: JSON.stringify(patch.args ?? {}),
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
          parts[index] = { ...parts[index], ...patch };
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

  const onCancel = useCallback(() => {
    abortRef.current?.();
    setIsRunning(false);
  }, []);

  const onAddToolResult = useCallback(
    ({ toolCallId, result }: { toolCallId: string; result: unknown }) => {
      const approved = (result as { approved: boolean }).approved;
      const targetId = conversationIdRef.current;
      if (!targetId) return;

      upsertToolCall(toolCallId, { result });

      const part = messages
        .flatMap(m => m.content)
        .find(p => p.type === 'tool-call' && p.toolCallId === toolCallId) as
        | { args: { name: string; arguments: Record<string, unknown> } }
        | undefined;
      if (!part) return;

      respondToApproval(targetId, {
        tool_call_id: toolCallId,
        tool_name: part.args.name,
        arguments: part.args.arguments,
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

  return useExternalStoreRuntime({
    messages,
    setMessages,
    isRunning,
    onNew,
    onCancel,
    onAddToolResult,
    convertMessage: (message: ThreadMessageLike) => message,
  });
}
