import { ZobiClient } from '@zobi.dev/core';
import {
  AgentMode,
  Attachment,
  Conversation,
  ConversationDetail,
  ModeOption,
  StreamEvent,
  Transcription,
} from './types';

const BASE = '/api/v1/zobi_agent';

/**
 * Borrow ZobiClient's CSRF token for requests it cannot make itself.
 *
 * Streaming and multipart uploads both bypass ZobiClient: the former because
 * it buffers whole responses, the latter because upload progress needs an
 * XMLHttpRequest. Neither should re-implement the CSRF handshake.
 */
const getCsrfToken = (): Promise<string | undefined> =>
  (
    ZobiClient as unknown as {
      getCSRFToken?: () => Promise<string | undefined>;
    }
  ).getCSRFToken?.() ?? Promise.resolve(undefined);

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
  body: {
    content: string;
    mode?: AgentMode;
    model_alias?: string | null;
    attachment_ids?: number[];
  },
  onEvent: (event: StreamEvent) => void,
  onError: (message: string) => void,
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const csrf = await getCsrfToken();

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

/**
 * Upload one file to a conversation, reporting bytes sent as they go.
 *
 * XMLHttpRequest rather than fetch: fetch cannot report how much of a request
 * body has been sent, and a slow upload with no progress is indistinguishable
 * from a hung one.
 *
 * `onError` is handed the raw failure (a Response or an Error) rather than a
 * string so the caller can run it through describeApiError and show whatever
 * the server actually said.
 *
 * @returns an abort function, for a file removed while still uploading.
 */
export function uploadAttachment(
  conversationId: number,
  file: File,
  handlers: {
    onProgress?: (percent: number) => void;
    onDone: (attachment: Attachment) => void;
    onError: (reason: unknown) => void;
  },
): () => void {
  const request = new XMLHttpRequest();
  let cancelled = false;

  const failWithBody = () => {
    // status 0 means the request never completed, so there is no body to
    // read; a TypeError is what getClientErrorObject reads as a network error.
    if (request.status < 200 || request.status > 599) {
      handlers.onError(new TypeError('Failed to fetch'));
      return;
    }
    // Re-wrap the body as a Response so the shared error reader can pull the
    // server's own message out of it.
    handlers.onError(
      new Response(request.responseText, {
        status: request.status,
        statusText: request.statusText,
      }),
    );
  };

  (async () => {
    let csrf: string | undefined;
    try {
      csrf = await getCsrfToken();
    } catch {
      // Send without a token and let the server object: replacing the
      // server's rejection with a token-fetch error would hide the real one.
    }
    if (cancelled) return;

    const form = new FormData();
    form.append('file', file);

    request.open(
      'POST',
      `${BASE}/conversation/${conversationId}/attachment`,
      true,
    );
    request.withCredentials = true;
    if (csrf) request.setRequestHeader('X-CSRFToken', csrf);

    request.upload.onprogress = event => {
      if (event.lengthComputable && event.total > 0) {
        handlers.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        try {
          handlers.onDone(
            JSON.parse(request.responseText).result as Attachment,
          );
        } catch (error) {
          handlers.onError(error);
        }
        return;
      }
      failWithBody();
    };

    request.onerror = () => handlers.onError(new TypeError('Failed to fetch'));
    request.ontimeout = () =>
      handlers.onError(new TypeError('Failed to fetch'));

    // FormData sets its own multipart Content-Type, including the boundary.
    request.send(form);
  })();

  return () => {
    cancelled = true;
    request.abort();
  };
}

export const deleteAttachment = (attachmentId: number) =>
  ZobiClient.delete({ endpoint: `${BASE}/attachment/${attachmentId}` });

/**
 * Transcribe a recorded clip.
 *
 * A failed response is thrown rather than mapped to a string so the caller can
 * run it through describeApiError. That matters most for the 503 raised when
 * no transcription backend is configured: the server explains what is missing,
 * and a generic "transcription failed" would throw that explanation away.
 */
export async function transcribeAudio(
  clip: Blob,
  filename = 'recording.webm',
): Promise<Transcription> {
  const csrf = await getCsrfToken();

  const form = new FormData();
  form.append('audio', clip, filename);

  const response = await fetch(`${BASE}/transcribe`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: csrf ? { 'X-CSRFToken': csrf } : {},
    body: form,
  });

  if (!response.ok) throw response;

  return (await response.json()).result as Transcription;
}
