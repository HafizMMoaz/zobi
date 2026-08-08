import { FC } from 'react';
import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  ToolCallMessagePartProps,
  unstable_useComposerInput,
} from '@assistant-ui/react';
import ToolActivity from './ToolActivity';
import './styles.css';

const DEFAULT_SUGGESTIONS = [
  { label: 'Weather', prompt: "What's the weather like today?" },
  { label: 'Code', prompt: 'Help me write some code.' },
  { label: 'Write', prompt: 'Help me write something.' },
  { label: 'Analyze', prompt: 'Help me analyze some data.' },
  { label: 'Brainstorm', prompt: 'Help me brainstorm ideas.' },
];

const UserMessage: FC = () => (
  <MessagePrimitive.Root className="aui:ml-auto aui:max-w-[80%] aui:rounded-2xl aui:bg-blue-600 aui:px-4 aui:py-2 aui:text-white">
    <MessagePrimitive.Parts />
  </MessagePrimitive.Root>
);

/** Task 10 gives approval requests their own renderer; see ToolFallback. */
const APPROVAL_TOOL_NAME = 'request_approval';

/**
 * Renderer for every tool call that has no tool registered under its name.
 *
 * Zobi's tools are executed by the backend and streamed in by `runtime.ts`,
 * so their names are only known at runtime and their `result` is already
 * populated by the time the part first renders - there is nothing to register
 * a toolkit entry (or a client-side `execute`) against. assistant-ui routes
 * exactly this case through `components.tools.Fallback` on
 * `MessagePrimitive.Parts`, which it consults whenever
 * `tools.by_name[toolName]` and the runtime's registered tool UIs both miss.
 */
const ToolFallback: FC<ToolCallMessagePartProps> = ({
  toolName,
  args,
  result,
}) => {
  if (toolName === APPROVAL_TOOL_NAME) return null;
  return (
    <ToolActivity
      toolName={toolName}
      args={(args ?? {}) as Record<string, unknown>}
      result={result as { ok: boolean; output?: string } | undefined}
    />
  );
};

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="aui:max-w-[80%] aui:rounded-2xl aui:bg-gray-100 aui:px-4 aui:py-2 aui:text-gray-900">
    <MessagePrimitive.Parts components={{ tools: { Fallback: ToolFallback } }} />
  </MessagePrimitive.Root>
);

export type ThreadProps = {
  welcomeSuggestions?: { label: string; prompt: string }[];
  /** Rendered above the composer input, e.g. the model/mode switcher. */
  composerToolbar?: React.ReactNode;
  /**
   * Rendered in the composer's action row, e.g. voice input. Takes the same
   * draft/setDraft bridge as `composerSlashPalette`, for the same reason: an
   * action that needs to write into the composer (voice transcription
   * appending its text) has to go through `unstable_useComposerInput`'s
   * `setText`, not a prop this component could pass down on its own.
   */
  composerActions?: (
    draft: string,
    setDraft: (text: string) => void,
  ) => React.ReactNode;
  /**
   * Rendered above the composer input with live access to its draft text and
   * a setter, e.g. the slash-command palette. `ComposerPrimitive.Input`'s
   * visible value is always sourced from the runtime's own composer state
   * (not from any prop this component could pass down), so `setDraft` writes
   * straight through `unstable_useComposerInput`'s `setText`, the same
   * headless bridge the input itself is built on - a plain local `useState`
   * mirror would not be reflected in the textarea.
   */
  composerSlashPalette?: (
    draft: string,
    setDraft: (text: string) => void,
  ) => React.ReactNode;
};

const Thread: FC<ThreadProps> = ({
  welcomeSuggestions = DEFAULT_SUGGESTIONS,
  composerToolbar,
  composerActions,
  composerSlashPalette,
}) => {
  const { value: draft, setText: setDraft } = unstable_useComposerInput();

  return (
    <ThreadPrimitive.Root className="aui-scope aui:flex aui:h-full aui:flex-col">
      <ThreadPrimitive.Viewport className="aui:flex-1 aui:overflow-y-auto aui:px-4 aui:py-6">
        <ThreadPrimitive.Empty>
          <div className="aui:flex aui:h-full aui:flex-col aui:items-center aui:justify-center aui:gap-6">
            <h2 className="aui:text-xl aui:font-semibold">How can I help you today?</h2>
            <div className="aui:flex aui:flex-wrap aui:justify-center aui:gap-2">
              {welcomeSuggestions.map(suggestion => (
                <ThreadPrimitive.Suggestion
                  key={suggestion.label}
                  prompt={suggestion.prompt}
                  send
                  className="aui:rounded-full aui:border aui:px-4 aui:py-2 aui:text-sm hover:aui:bg-gray-50"
                >
                  {suggestion.label}
                </ThreadPrimitive.Suggestion>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>
        <ThreadPrimitive.Messages
          components={{ UserMessage, AssistantMessage }}
        />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className="aui:border-t aui:p-3">
        {composerToolbar}
        {composerSlashPalette?.(draft, setDraft)}
        <div className="aui:flex aui:items-end aui:gap-2">
          <ComposerPrimitive.Input
            placeholder="Send a message..."
            className="aui:min-h-11 aui:flex-1 aui:resize-none aui:rounded-xl aui:border aui:px-3 aui:py-2"
          />
          {composerActions?.(draft, setDraft)}
          <ComposerPrimitive.Send className="aui:rounded-full aui:bg-blue-600 aui:px-4 aui:py-2 aui:text-white" />
        </div>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
};

export default Thread;
