import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import {
  createConversation,
  fetchChatModels,
  fetchConversation,
  fetchModes,
  updateConversation,
} from '../api';
import { AgentMode, ChatMessage, ChatModel, ModeOption } from '../types';
import ComposerSwitcher from '../ComposerSwitcher';
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
      />
    </AssistantRuntimeProvider>
  );
};

export default ZobiChat;
