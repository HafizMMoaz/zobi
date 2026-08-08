import { FC } from 'react';
import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  unstable_useComposerInput,
} from '@assistant-ui/react';
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

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="aui:max-w-[80%] aui:rounded-2xl aui:bg-gray-100 aui:px-4 aui:py-2 aui:text-gray-900">
    <MessagePrimitive.Parts />
  </MessagePrimitive.Root>
);

export type ThreadProps = {
  welcomeSuggestions?: { label: string; prompt: string }[];
  /** Rendered above the composer input, e.g. the model/mode switcher. */
  composerToolbar?: React.ReactNode;
  /** Rendered in the composer's action row, e.g. attach/voice buttons. */
  composerActions?: React.ReactNode;
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
          {composerActions}
          <ComposerPrimitive.Send className="aui:rounded-full aui:bg-blue-600 aui:px-4 aui:py-2 aui:text-white" />
        </div>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
};

export default Thread;
