import { ZobiClient } from '@zobi.dev/core';
import {
  AgentMode,
  Conversation,
  ConversationDetail,
  ModeOption,
  StreamEvent,
} from './types';

const BASE = '/api/v1/zobi_agent';

export const fetchModes = (): Promise<ModeOption[]> =>
  ZobiClient.get({ endpoint: `${BASE}/modes/` }).then(
    ({ json }) => json.result,
  );

export const fetchConversations = (): Promise<Conversation[]> =>
  ZobiClient.get({ endpoint: `${BASE}/conversation/` }).then(
    ({ json }) => json.result,
  );

export const fetchConversation = (id: number): Promise<ConversationDetail> =>
  ZobiClient.get({ endpoint: `${BASE}/conversation/${id}` }).then(
    ({ json }) => json.result,
  );

export const createConversation = (
  mode: AgentMode = 'manual',
): Promise<{ id: number; uuid: string }> =>
  ZobiClient.post({
    endpoint: `${BASE}/conversation/`,
    jsonPayload: { mode },
  }).then(({ json }) => json as unknown as { id: number; uuid: string });

export const updateConversation = (
  id: number,
  patch: Partial<Pick<Conversation, 'title' | 'mode' | 'model_alias'>> & {
    is_archived?: boolean;
  },
) =>
  ZobiClient.put({
    endpoint: `${BASE}/conversation/${id}`,
    jsonPayload: patch,
  });

export const deleteConversation = (id: number) =>
  ZobiClient.delete({ endpoint: `${BASE}/conversation/${id}` });

export const respondToApproval = (
  conversationId: number,
  payload: {
    tool_call_id: string;
    tool_name: string;
    arguments: Record<string, unknown>;
    approved: boolean;
  },
): Promise<{ ok: boolean; output?: string }> =>
  ZobiClient.post({
    endpoint: `${BASE}/conversation/${conversationId}/approve`,
    jsonPayload: payload,
  }).then(({ json }) => json.result);

/**
 * Send a message and consume the reply as it streams.
 *
 * Uses fetch with a ReadableStream rather than EventSource: EventSource can
 * only issue GET requests, and the message body plus CSRF token need a POST.
 * ZobiClient is bypassed for the same reason, since it buffers the whole
 * response before resolving, which would defeat streaming entirely.
 *
 * @returns an abort function, so a caller can stop a turn mid-flight.
 */
export function streamMessage(
  conversationId: number,
  body: { content: string; mode?: AgentMode; model_alias?: string | null },
  onEvent: (event: StreamEvent) => void,
  onError: (message: string) => void,
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      // ZobiClient owns CSRF token retrieval, so reuse it rather than
      // duplicating the handshake here.
      const csrf = await (
        ZobiClient as unknown as {
          getCSRFToken?: () => Promise<string | undefined>;
        }
      ).getCSRFToken?.();

      const response = await fetch(
        `${BASE}/conversation/${conversationId}/stream`,
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            ...(csrf ? { 'X-CSRFToken': csrf } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );

      if (!response.ok || !response.body) {
        onError(`Request failed with status ${response.status}`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line. A chunk can split a frame
        // anywhere, so keep the trailing partial in the buffer.
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        frames.forEach(frame => {
          const line = frame
            .split('\n')
            .find(candidate => candidate.startsWith('data: '));
          if (!line) return;
          try {
            onEvent(JSON.parse(line.slice(6)) as StreamEvent);
          } catch {
            // A malformed frame should not kill the stream; the turn may
            // still produce useful events after it.
          }
        });
      }
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        onError((error as Error)?.message || 'Connection lost');
      }
    }
  })();

  return () => controller.abort();
}
