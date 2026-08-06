/** Autonomy granted to Zobi for a conversation. Mirrors zobi/agent/permissions.py. */
export type AgentMode = 'read_only' | 'manual' | 'auto' | 'full';

export type ModeOption = {
  value: AgentMode;
  label: string;
  description: string;
};

export type ToolRisk = 'read' | 'write' | 'destructive';

/** One tool as listed by GET /tools/, for the slash palette. */
export type AgentToolSummary = {
  name: string;
  title: string;
  risk: ToolRisk;
  description: string;
};

/**
 * One selectable model, as listed by GET /models/.
 *
 * `alias` names a pool rather than a deployment: the gateway load balances
 * across every model row sharing an alias.
 */
export type ChatModel = {
  alias: string;
  is_default: boolean;
};

export type ToolCall = {
  id: string;
  type: string;
  function: { name: string; arguments: string };
};

export type ChatMessage = {
  id?: number;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string | null;
  tool_name?: string | null;
  extra?: Record<string, unknown>;
  created_on?: string | null;
};

export type Conversation = {
  id: number;
  uuid: string;
  title: string | null;
  mode: AgentMode;
  model_alias: string | null;
  changed_on?: string | null;
};

export type ConversationDetail = Conversation & {
  messages: ChatMessage[];
};

/** A tool call paused waiting for the user to approve or decline it. */
export type PendingApproval = {
  id: string;
  name: string;
  title: string;
  risk: ToolRisk;
  arguments: Record<string, unknown>;
  description: string;
};

/** Live record of one tool invocation, for showing activity as it happens. */
export type ToolActivity = {
  id: string;
  name: string;
  title: string;
  risk: ToolRisk;
  arguments: Record<string, unknown>;
  status: 'running' | 'ok' | 'failed';
  output?: string;
};

/** How the backend classified an uploaded file. Mirrors the attachment API. */
export type AttachmentKind = 'csv' | 'sql' | 'pdf' | 'image' | 'other';

/**
 * Server-side lifecycle of an attachment.
 *
 * `pending` means the bytes have landed but the file has not been parsed or
 * summarised yet, so a chip can stay on screen while that work happens.
 */
export type AttachmentStatus = 'pending' | 'ready' | 'failed';

/** An attachment row as returned by the attachment endpoints. */
export type Attachment = {
  id: number;
  uuid: string;
  filename: string;
  kind: AttachmentKind;
  status: AttachmentStatus;
  size_bytes: number;
  summary: string | null;
  error: string | null;
};

/**
 * One chip in the composer.
 *
 * A file is shown the instant it is chosen, well before the server has given
 * it an id, so the row is keyed by a client-generated `localId` and carries
 * the server row only once the upload returns. `error` covers the failures
 * that never reach the server at all, such as a file that is too large.
 */
export type AttachmentItem = {
  localId: string;
  filename: string;
  sizeBytes: number;
  kind: AttachmentKind;
  /** Bytes sent so far, 0-100, while the upload is in flight. */
  progress: number;
  /** The server row, once the upload has produced one. */
  attachment: Attachment | null;
  /** A client-side or transport failure, shown in place of the summary. */
  error: string | null;
};

/** Result of transcribing a recorded clip. */
export type Transcription = {
  text: string;
  language: string | null;
  backend: string;
};

/**
 * Events the backend pushes over SSE during a turn.
 *
 * Shapes match TurnEvent in zobi/agent/runtime.py; `type` discriminates.
 */
export type StreamEvent =
  | { type: 'token'; text: string }
  | { type: 'message_complete'; content: string; tool_calls: ToolCall[] }
  | {
      type: 'tool_start';
      id: string;
      name: string;
      title: string;
      risk: ToolRisk;
      arguments: Record<string, unknown>;
    }
  | {
      type: 'tool_result';
      id: string;
      name: string;
      ok: boolean;
      output: string;
    }
  | ({ type: 'approval_required' } & PendingApproval)
  | { type: 'error'; message: string }
  | { type: 'done' };
