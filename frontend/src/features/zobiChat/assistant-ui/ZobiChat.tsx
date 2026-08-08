import { FC, FunctionComponent, useEffect, useRef, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import {
  AssistantRuntimeProvider,
  ToolCallMessagePartComponent,
  useAssistantTool,
} from '@assistant-ui/react';
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
import ApprovalTool, { ApprovalToolArgs } from './ApprovalTool';

/**
 * Adapts `ApprovalTool` to `ToolCallMessagePartComponent`.
 *
 * `MessagePartState` (the base every tool-call render prop type is built on)
 * folds in every part variant's *default*-generic shape, so the `args` field
 * assistant-ui hands a `render` component is typed as `ReadonlyJSONObject &
 * ApprovalToolArgs`, not plain `ApprovalToolArgs` - passing `ApprovalTool`
 * (a `React.FC`, whose `propTypes` member is checked structurally) straight
 * through as `render` fails type-checking against that wider type. A plain
 * function has no `propTypes` to check, so re-narrowing through one here
 * (rather than loosening `ApprovalTool`'s own prop types) sidesteps it
 * without weakening the component the tests exercise directly.
 */
const renderApprovalTool: ToolCallMessagePartComponent<
  ApprovalToolArgs,
  { approved: boolean }
> = ({ args, result, addResult }) => (
  <ApprovalTool args={args} result={result} addResult={addResult} />
);

/**
 * Registers `request_approval` against the assistant-ui model context, with
 * `renderApprovalTool` as its renderer.
 *
 * `useAssistantTool` needs `AssistantRuntimeProvider`'s context, so this has
 * to be a child of that provider rather than inline in `ZobiChat` itself
 * (whose own render runs before its returned provider element mounts).
 *
 * `type: 'human'` (rather than `execute: humanTool()`, as `@assistant-ui`'s
 * docs show) is deliberate: `humanTool()` has no runtime implementation - a
 * `"use generative"` build step is what turns it into a `type: 'human'` tool
 * definition, and this project has no such build step, so calling it throws.
 * Authoring the `type: 'human'` shape directly is what that compiler would
 * have produced anyway, and there is nothing here for `execute` to do: the
 * backend, not this tool, decides the outcome (`runtime.ts`'s
 * `onAddToolResult` forwards `addResult`'s payload to `respondToApproval`).
 */
const ApprovalToolRegistration: FC = () => {
  useAssistantTool({
    toolName: 'request_approval',
    type: 'human',
    description: 'Requests human approval before a risky action proceeds.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        title: { type: 'string' },
        risk: { type: 'string' },
        description: { type: 'string' },
        arguments: { type: 'object' },
      },
      required: ['name', 'title', 'risk', 'description', 'arguments'],
    },
    render: renderApprovalTool,
  });
  return null;
};

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
  // Which conversation's history has already been applied to this instance.
  // `undefined` means "none yet", which is why this cannot be folded into
  // `idRef` (that one starts out mirroring the prop, so it would suppress the
  // very first load).
  const loadedIdRef = useRef<number | null | undefined>(undefined);

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

  // A conversation created mid-turn arrives here as a null -> <id> change of
  // the `conversationId` prop on this same (no longer remounted) instance.
  // `ensureConversation` has already claimed that id below, so re-fetching it
  // would replace the transcript being streamed right now with the server's
  // not-yet-written history.
  useEffect(() => {
    if (loadedIdRef.current === conversationId) return;
    loadedIdRef.current = conversationId;
    idRef.current = conversationId;
    if (!conversationId) {
      setInitialMessages([]);
      setThreadModel(null);
      return;
    }
    fetchConversation(conversationId)
      .then(detail => {
        setInitialMessages(detail.messages);
        setMode(detail.mode);
        setThreadModel(detail.model_alias);
      })
      .catch(() => setError(t('Could not load this conversation.')));
  }, [conversationId]);

  const ensureConversation = () => {
    if (idRef.current) return Promise.resolve(idRef.current);
    if (!creatingRef.current) {
      creatingRef.current = createConversation(mode)
        .then(created => {
          idRef.current = created.id;
          loadedIdRef.current = created.id;
          onConversationStarted?.(created.id);
          return created.id;
        })
        // Without this every later send would re-await the same rejected
        // promise, locking the chat for good after one failed create.
        .catch(err => {
          creatingRef.current = null;
          setError(t('Could not start a conversation.'));
          throw err;
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
      <ApprovalToolRegistration />
      {header}
      {error && <div role="alert">{error}</div>}
      <Thread
        composerToolbar={
          <ComposerSwitcher
            modes={modes}
            mode={mode}
            onModeChange={next => {
              setMode(next);
              if (idRef.current)
                updateConversation(idRef.current, { mode: next }).catch(() =>
                  setError(t('Could not save your mode choice.')),
                );
            }}
            models={models}
            threadModel={threadModel}
            onThreadModelChange={alias => {
              setThreadModel(alias);
              // Persisting the choice needs a conversation to exist, so a
              // failed create surfaces here too rather than going unhandled.
              (idRef.current
                ? Promise.resolve(idRef.current)
                : ensureConversation()
              )
                .then(id => updateConversation(id, { model_alias: alias }))
                .catch(() => setError(t('Could not save your model choice.')));
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
