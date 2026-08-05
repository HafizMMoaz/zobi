/** Autonomy granted to Zobi for a conversation. Mirrors zobi/agent/permissions.py. */
export type AgentMode = 'read_only' | 'manual' | 'auto' | 'full';

export type ModeOption = {
  value: AgentMode;
  label: string;
  description: string;
};

export type ToolRisk = 'read' | 'write' | 'destructive';

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
