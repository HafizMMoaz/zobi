import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import {
  createConversation,
  fetchChatModels,
  fetchConversation,
  fetchModes,
  fetchTools,
  updateConversation,
} from '../api';
import {
  AgentMode,
  AgentToolSummary,
  ChatMessage,
  ChatModel,
  ModeOption,
} from '../types';
import ComposerSwitcher from '../ComposerSwitcher';
import SlashPalette from '../SlashPalette';
import VoiceInput from '../VoiceInput';
import { createAttachmentAdapter } from './attachmentAdapter';
import { useZobiChatRuntime } from './runtime';
import Thread from './Thread';

export type ZobiChatProps = {
  /** Existing conversation to open; omit to start a new one on first send. */
  conversationId?: number | null;
  onConversationStarted?: (id: number) => void;
  /** Rendered above the transcript, e.g. a page heading. */
  header?: React.ReactNode;
};

const ZobiChat: FunctionComponent<ZobiChatProps> = ({
  conversationId = null,
  onConversationStarted,
  header,
}) => {
  const [mode, setMode] = useState<AgentMode>('manual');
  const [modes, setModes] = useState<ModeOption[]>([]);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [tools, setTools] = useState<AgentToolSummary[]>([]);
  // The thread's persisted model, mirrored from the conversation row.
  const [threadModel, setThreadModel] = useState<string | null>(null);
  // Applies to the next send only, then reverts to the thread's.
  const [onceModel, setOnceModel] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<number | null>(conversationId);
  const creatingRef = useRef<Promise<number> | null>(null);

  useEffect(() => {
    fetchModes()
      .then(setModes)
      .catch(() => setModes([]));
  }, []);

  useEffect(() => {
    fetchChatModels()
      .then(setModels)
      .catch(() => setModels([]));
  }, []);

  // The offer depends on the mode, so refetch whenever it changes. A failure
  // leaves the list empty: the palette degrades to an empty state and typing
  // still works.
  useEffect(() => {
    fetchTools(mode)
      .then(setTools)
      .catch(() => setTools([]));
  }, [mode]);

  useEffect(() => {
    idRef.current = conversationId;
    if (!conversationId) {
      setInitialMessages([]);
      setThreadModel(null);
      return;
    }
    fetchConversation(conversationId).then(detail => {
      setInitialMessages(detail.messages);
      setMode(detail.mode);
      setThreadModel(detail.model_alias);
    });
  }, [conversationId]);

  const ensureConversation = () => {
    if (idRef.current) return Promise.resolve(idRef.current);
    if (!creatingRef.current) {
      creatingRef.current = createConversation(mode).then(created => {
        idRef.current = created.id;
        onConversationStarted?.(created.id);
        return created.id;
      });
    }
    return creatingRef.current;
  };

  const runtime = useZobiChatRuntime({
    conversationId: idRef.current,
    mode,
    onceModel,
    initialMessages,
    onConversationStarted: ensureConversation,
    onSent: () => setOnceModel(null),
    onError: setError,
    attachments: createAttachmentAdapter(ensureConversation),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {header}
      {error && <div role="alert">{error}</div>}
      <Thread
        composerToolbar={
          <ComposerSwitcher
            modes={modes}
            mode={mode}
            onModeChange={next => {
              setMode(next);
              if (idRef.current) updateConversation(idRef.current, { mode: next });
            }}
            models={models}
            threadModel={threadModel}
            onThreadModelChange={async alias => {
              setThreadModel(alias);
              const id = idRef.current ?? (await ensureConversation());
              updateConversation(id, { model_alias: alias });
            }}
            onceModel={onceModel}
            onOnceModelChange={setOnceModel}
          />
        }
        composerActions={(draft, setDraft) => (
          <VoiceInput
            // Appends rather than replaces: speech recognition misreads
            // names and numbers, so the user needs to be able to dictate a
            // correction alongside whatever they already typed.
            onTranscript={text =>
              setDraft(draft.trim() ? `${draft.trim()} ${text}` : text)
            }
            onError={setError}
          />
        )}
        composerSlashPalette={(draft, setDraft) => {
          // The palette is open while the draft is a bare "/name" with no
          // space yet; a space means the user has moved on to writing the
          // request itself.
          const slashQuery =
            draft.startsWith('/') && !draft.includes(' ')
              ? draft.slice(1)
              : null;
          return (
            <SlashPalette
              tools={tools}
              query={slashQuery ?? ''}
              open={slashQuery !== null}
              onSelect={tool => setDraft(`/${tool.name} `)}
              onDismiss={() => setDraft('')}
            />
          );
        }}
      />
    </AssistantRuntimeProvider>
  );
};

export default ZobiChat;
