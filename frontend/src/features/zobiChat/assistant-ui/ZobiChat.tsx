import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { createConversation, fetchConversation } from '../api';
import { AgentMode, ChatMessage } from '../types';
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
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<number | null>(conversationId);
  const creatingRef = useRef<Promise<number> | null>(null);

  useEffect(() => {
    idRef.current = conversationId;
    if (!conversationId) {
      setInitialMessages([]);
      return;
    }
    fetchConversation(conversationId).then(detail => {
      setInitialMessages(detail.messages);
      setMode(detail.mode);
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
    initialMessages,
    onConversationStarted: ensureConversation,
    onError: setError,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {header}
      {error && <div role="alert">{error}</div>}
      <Thread />
    </AssistantRuntimeProvider>
  );
};

export default ZobiChat;
