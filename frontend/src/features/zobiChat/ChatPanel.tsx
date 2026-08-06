import {
  ClipboardEvent,
  DragEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { Alert } from '@zobi.dev/extension-api/components';
import {
  Button,
  Input,
  SafeMarkdown,
  Select,
  Space,
  Tag,
} from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Typography } from '@zobi.dev/core/components/Typography';
import {
  createConversation,
  fetchChatModels,
  fetchConversation,
  fetchModes,
  fetchTools,
  respondToApproval,
  streamMessage,
  updateConversation,
} from './api';
import {
  AttachButton,
  AttachmentList,
  carriesFiles,
  useAttachments,
} from './Attachments';
import ModelPicker from './ModelPicker';
import SlashPalette from './SlashPalette';
import VoiceInput from './VoiceInput';
import {
  AgentMode,
  AgentToolSummary,
  ChatMessage,
  ChatModel,
  ModeOption,
  PendingApproval,
  ToolActivity,
} from './types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const Scroller = styled.div`
  ${({ theme }) => css`
    flex: 1;
    overflow-y: auto;
    padding: ${theme.sizeUnit * 3}px;
    display: flex;
    flex-direction: column;
    gap: ${theme.sizeUnit * 3}px;
  `}
`;

const Bubble = styled.div<{ messageRole: string }>`
  ${({ theme, messageRole: role }) => css`
    max-width: ${role === 'user' ? '85%' : '100%'};
    align-self: ${role === 'user' ? 'flex-end' : 'flex-start'};
    padding: ${theme.sizeUnit * 2}px ${theme.sizeUnit * 3}px;
    border-radius: ${theme.borderRadius}px;
    background: ${role === 'user'
      ? theme.colorPrimaryBg
      : theme.colorBgContainer};
    border: 1px solid
      ${role === 'user' ? theme.colorPrimaryBorder : theme.colorBorderSecondary};
    word-break: break-word;

    p:last-child {
      margin-bottom: 0;
    }

    table {
      border-collapse: collapse;
      margin: ${theme.sizeUnit}px 0;
      display: block;
      overflow-x: auto;
    }

    th,
    td {
      border: 1px solid ${theme.colorBorderSecondary};
      padding: ${theme.sizeUnit}px ${theme.sizeUnit * 2}px;
      text-align: left;
    }
  `}
`;

const ToolRow = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.sizeUnit}px;
    font-size: ${theme.fontSizeSM}px;
    color: ${theme.colorTextSecondary};
    align-self: flex-start;
  `}
`;

const ApprovalCard = styled.div`
  ${({ theme }) => css`
    align-self: stretch;
    border: 1px solid ${theme.colorWarningBorder};
    background: ${theme.colorWarningBg};
    border-radius: ${theme.borderRadius}px;
    padding: ${theme.sizeUnit * 3}px;

    pre {
      background: ${theme.colorBgLayout};
      padding: ${theme.sizeUnit * 2}px;
      border-radius: ${theme.borderRadius}px;
      max-height: 180px;
      overflow: auto;
      font-size: ${theme.fontSizeSM}px;
      margin: ${theme.sizeUnit * 2}px 0;
    }
  `}
`;

const Composer = styled.div<{ dropping: boolean }>`
  ${({ theme, dropping }) => css`
    border-top: 1px solid ${theme.colorBorderSecondary};
    padding: ${theme.sizeUnit * 3}px;
    display: flex;
    flex-direction: column;
    gap: ${theme.sizeUnit * 2}px;
    background: ${dropping ? theme.colorPrimaryBg : 'transparent'};
    outline: ${dropping ? `2px dashed ${theme.colorPrimaryBorder}` : 'none'};
    outline-offset: -${theme.sizeUnit}px;
  `}
`;

const ComposerRow = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.sizeUnit * 2}px;
    align-items: flex-end;

    /*
     * Attach, mic and send are rendered by three separate components but read
     * as one control group, so the row owns their geometry rather than each
     * component guessing at it. antd sizes a button to its own content, which
     * is why send grew once it became primary and why the icons did not line
     * up. Pinning to controlHeight is what the text input uses, so the whole
     * row ends up on the same square grid.
     */
    button {
      flex: none;
      width: ${theme.controlHeight}px;
      min-width: ${theme.controlHeight}px;
      height: ${theme.controlHeight}px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: ${theme.borderRadius}px;
    }
  `}
`;

const ModeHint = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fontSizeXS}px;
    line-height: ${theme.lineHeightSM};
    color: ${theme.colorPrimary};
  `}
`;

const RISK_COLOR: Record<string, string> = {
  read: 'default',
  write: 'blue',
  destructive: 'red',
};

/**
 * How long a mode's description stays up after the user switches modes.
 *
 * The description is a confirmation of what just changed, not a standing label,
 * so it clears itself rather than permanently occupying a row of the composer.
 */
const MODE_HINT_MS = 4000;

interface ChatPanelProps {
  /** Existing conversation to open; omit to start a new one on first send. */
  conversationId?: number | null;
  onConversationStarted?: (id: number) => void;
  /** Rendered above the transcript, e.g. a page heading. */
  header?: React.ReactNode;
}

const ChatPanel: FunctionComponent<ChatPanelProps> = ({
  conversationId = null,
  onConversationStarted,
  header,
}) => {
  const [id, setId] = useState<number | null>(conversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [activity, setActivity] = useState<ToolActivity[]>([]);
  const [approval, setApproval] = useState<PendingApproval | null>(null);
  const [mode, setMode] = useState<AgentMode>('manual');
  const [modes, setModes] = useState<ModeOption[]>([]);
  const [modeHint, setModeHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [tools, setTools] = useState<AgentToolSummary[]>([]);
  const [pinnedTool, setPinnedTool] = useState<AgentToolSummary | null>(null);
  const [models, setModels] = useState<ChatModel[]>([]);
  // The thread's persisted model, mirrored from the conversation row.
  const [threadModel, setThreadModel] = useState<string | null>(null);
  // Applies to the next send only, then reverts to the thread's.
  const [onceModel, setOnceModel] = useState<string | null>(null);

  const abortRef = useRef<(() => void) | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hintTimerRef = useRef<number | null>(null);

  // Drop the pending hint timer on unmount so it cannot fire into a component
  // that is already gone.
  useEffect(
    () => () => {
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    },
    [],
  );

  // Attaching a file and sending a message both need a conversation, and
  // either can be the first to want one. These refs let the two paths share a
  // single creation, without waiting for a state update to land.
  const idRef = useRef<number | null>(conversationId);
  const creatingRef = useRef<Promise<number> | null>(null);

  // dragenter/dragleave also fire for every child element the pointer crosses,
  // so the highlight is driven by a depth count rather than the last event.
  const dragDepth = useRef(0);

  const ensureConversation = useCallback((): Promise<number> => {
    if (idRef.current) return Promise.resolve(idRef.current);
    if (!creatingRef.current) {
      creatingRef.current = createConversation(mode)
        .then(created => {
          idRef.current = created.id;
          setId(created.id);
          onConversationStarted?.(created.id);
          return created.id;
        })
        .catch(reason => {
          // Clear the cached promise so the next attempt can retry rather
          // than replaying this failure forever.
          creatingRef.current = null;
          throw reason;
        });
    }
    return creatingRef.current;
  }, [mode, onConversationStarted]);

  const attachments = useAttachments(ensureConversation);

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

  /**
   * The palette is open while the draft is a bare "/name" with no space yet.
   * A space means the user has moved on to writing the request itself.
   */
  const slashQuery =
    draft.startsWith('/') && !draft.includes(' ') ? draft.slice(1) : null;
  const paletteOpen = slashQuery !== null;

  const { clear: clearAttachments } = attachments;

  useEffect(() => {
    setId(conversationId);
    idRef.current = conversationId;
    creatingRef.current = null;
    // Chips belong to the conversation they were uploaded against, so they
    // must not follow the user into a different one.
    clearAttachments();
    if (!conversationId) {
      setMessages([]);
      setThreadModel(null);
      return;
    }
    fetchConversation(conversationId)
      .then(detail => {
        setMessages(detail.messages);
        setMode(detail.mode);
        setThreadModel(detail.model_alias);
      })
      .catch(() => setError(t('Could not load this conversation.')));
  }, [conversationId, clearAttachments]);

  // Follow the newest content as it streams in.
  useEffect(() => {
    const node = scrollerRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, streamingText, activity, approval]);

  const handleEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'token':
        setStreamingText(current => current + event.text);
        break;
      case 'message_complete':
        // Only commit a bubble when there is text: a message that exists
        // purely to carry tool calls would render as an empty box.
        if (event.content) {
          setMessages(current => [
            ...current,
            { role: 'assistant', content: event.content },
          ]);
        }
        setStreamingText('');
        break;
      case 'tool_start':
        setActivity(current => [
          ...current,
          {
            id: event.id,
            name: event.name,
            title: event.title,
            risk: event.risk,
            arguments: event.arguments,
            status: 'running',
          },
        ]);
        break;
      case 'tool_result':
        setActivity(current =>
          current.map(item =>
            item.id === event.id
              ? {
                  ...item,
                  status: event.ok ? 'ok' : 'failed',
                  output: event.output,
                }
              : item,
          ),
        );
        break;
      case 'approval_required':
        setApproval(event as PendingApproval);
        setBusy(false);
        break;
      case 'error':
        setError(event.message);
        setBusy(false);
        break;
      case 'done':
        setBusy(false);
        break;
      default:
        break;
    }
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || busy) return;
      setError(null);
      setBusy(true);
      setStreamingText('');
      setActivity([]);
      setMessages(current => [...current, { role: 'user', content: text }]);
      setDraft('');

      // Read the ids before clearing: the chips are the user's record of what
      // this message carried, and they go once the turn is under way.
      const attachmentIds = attachments.ids;

      let target: number;
      try {
        target = await ensureConversation();
      } catch {
        setError(t('Could not start a conversation.'));
        setBusy(false);
        return;
      }

      attachments.clear();
      setPinnedTool(null);

      abortRef.current = streamMessage(
        target,
        {
          content: text,
          mode,
          model_alias: onceModel,
          force_tool: pinnedTool?.name ?? null,
          ...(attachmentIds.length ? { attachment_ids: attachmentIds } : {}),
        },
        handleEvent,
        message => {
          setError(message);
          setBusy(false);
        },
      );
      // The override applies to this send only; the next one falls back to
      // the thread's model until the picker is used again.
      setOnceModel(null);
    },
    [
      busy,
      mode,
      handleEvent,
      ensureConversation,
      attachments,
      pinnedTool,
      onceModel,
    ],
  );

  const decide = useCallback(
    async (approved: boolean) => {
      if (!approval || !id) return;
      const pending = approval;
      setApproval(null);
      setBusy(true);
      try {
        const result = await respondToApproval(id, {
          tool_call_id: pending.id,
          tool_name: pending.name,
          arguments: pending.arguments,
          approved,
        });
        setActivity(current => [
          ...current,
          {
            id: pending.id,
            name: pending.name,
            title: pending.title,
            risk: pending.risk,
            arguments: pending.arguments,
            status: approved && result.ok ? 'ok' : 'failed',
            output: approved ? result.output : t('Declined'),
          },
        ]);
        // Nudge the model to continue now that the call has an outcome.
        abortRef.current = streamMessage(
          id,
          {
            content: approved
              ? t('I approved that action. Please continue.')
              : t('I declined that action. Please suggest something else.'),
            mode,
          },
          handleEvent,
          message => {
            setError(message);
            setBusy(false);
          },
        );
      } catch {
        setError(t('Could not record your decision.'));
        setBusy(false);
      }
    },
    [approval, id, mode, handleEvent],
  );

  const changeMode = useCallback(
    (next: AgentMode) => {
      setMode(next);
      // Surface the new mode's description just long enough to be read. Only a
      // deliberate switch triggers it, so the mode pushed by an external sync
      // does not flash a hint the user did not ask for.
      setModeHint(
        modes.find(option => option.value === next)?.description ?? null,
      );
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = window.setTimeout(
        () => setModeHint(null),
        MODE_HINT_MS,
      );
      if (id) updateConversation(id, { mode: next }).catch(() => undefined);
    },
    [id, modes],
  );

  /**
   * Put a transcript in the draft instead of sending it.
   *
   * Speech recognition mangles column names and numbers often enough that
   * auto-sending would mostly produce turns the user has to correct afterwards.
   */
  const insertTranscript = useCallback((text: string) => {
    setDraft(current => (current.trim() ? `${current.trim()} ${text}` : text));
  }, []);

  const { addFiles } = attachments;

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!carriesFiles(event.dataTransfer)) return;
    dragDepth.current += 1;
    setDropping(true);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!carriesFiles(event.dataTransfer)) return;
    // Without this the browser treats the drop as navigation and replaces the
    // page with the file.
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!carriesFiles(event.dataTransfer)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (!dragDepth.current) setDropping(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!carriesFiles(event.dataTransfer)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDropping(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (!files.length) return;
      // A screenshot on the clipboard should become an attachment rather than
      // dropping its filename into the draft.
      event.preventDefault();
      addFiles(files);
    },
    [addFiles],
  );

  return (
    <Wrapper>
      {header}
      <Scroller ref={scrollerRef}>
        {!messages.length && !streamingText && (
          <Typography.Paragraph type="secondary">
            {t(
              'Ask about your data. Zobi can list databases and datasets, run ' +
                'queries, and build charts and dashboards.',
            )}
          </Typography.Paragraph>
        )}

        {messages
          .filter(message => message.role !== 'tool' && message.content)
          .map((message, index) => (
            // Transcript entries are only appended, never reordered.
            // eslint-disable-next-line react/no-array-index-key
            <Bubble key={message.id ?? index} messageRole={message.role}>
              {message.role === 'assistant' ? (
                <SafeMarkdown source={message.content ?? ''} />
              ) : (
                message.content
              )}
            </Bubble>
          ))}

        {activity.map(item => (
          <ToolRow key={`${item.id}-${item.status}`}>
            {item.status === 'running' ? (
              <Icons.LoadingOutlined />
            ) : item.status === 'ok' ? (
              <Icons.CheckCircleOutlined />
            ) : (
              <Icons.CloseCircleOutlined />
            )}
            <span>{item.title}</span>
            <Tag color={RISK_COLOR[item.risk]}>{item.risk}</Tag>
          </ToolRow>
        ))}

        {streamingText && (
          <Bubble messageRole="assistant">
            <SafeMarkdown source={streamingText} />
          </Bubble>
        )}

        {approval && (
          <ApprovalCard>
            <Typography.Text strong>
              {t('Zobi wants to run: %s', approval.title)}
            </Typography.Text>
            <Tag color={RISK_COLOR[approval.risk]}>{approval.risk}</Tag>
            <Typography.Paragraph type="secondary">
              {approval.description}
            </Typography.Paragraph>
            <pre>{JSON.stringify(approval.arguments, null, 2)}</pre>
            <Space>
              <Button buttonStyle="primary" onClick={() => decide(true)}>
                {t('Approve')}
              </Button>
              <Button onClick={() => decide(false)}>{t('Decline')}</Button>
            </Space>
          </ApprovalCard>
        )}

        {error && (
          <Alert
            type="error"
            showIcon
            message={t('Something went wrong')}
            description={error}
          />
        )}
      </Scroller>

      <Composer
        dropping={dropping}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        <Space>
          <Select
            value={mode}
            onChange={value => changeMode(value as AgentMode)}
            options={modes.map(option => ({
              value: option.value,
              label: option.label,
            }))}
            css={{ minWidth: 180 }}
          />
          {modeHint && <ModeHint>{modeHint}</ModeHint>}
          <ModelPicker
            models={models}
            value={threadModel}
            label={t('Model')}
            disabled={busy}
            onChange={alias => {
              setThreadModel(alias);
              // Unlike mode, the model alias has nowhere to ride along on the
              // conversation's own creation call, so picking one before the
              // first send has to bring the conversation into being itself
              // rather than waiting for `send` to do it.
              ensureConversation()
                .then(convId =>
                  updateConversation(convId, { model_alias: alias }),
                )
                .catch(() => undefined);
            }}
          />
          <ModelPicker
            models={models}
            value={onceModel}
            label={t('This message only')}
            disabled={busy}
            onChange={setOnceModel}
          />
        </Space>
        <AttachmentList
          items={attachments.items}
          onRemove={attachments.removeItem}
        />
        <SlashPalette
          tools={tools}
          query={slashQuery ?? ''}
          open={paletteOpen}
          onSelect={tool => {
            setPinnedTool(tool);
            setDraft('');
          }}
          onDismiss={() => setDraft('')}
        />
        {pinnedTool && (
          <Tag
            closable
            closeIcon={
              <Icons.CloseOutlined aria-label={t('Remove pinned tool')} />
            }
            onClose={() => setPinnedTool(null)}
          >
            {pinnedTool.title}
          </Tag>
        )}
        <ComposerRow>
          <AttachButton onFiles={attachments.addFiles} disabled={busy} />
          <Input.TextArea
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onPressEnter={event => {
              // While the palette is open, Enter picks the highlighted tool
              // via SlashPalette's own document-level listener. That listener
              // sits below this handler in the bubble order (React dispatches
              // synthetic events from the root container, which is above the
              // textarea but below document), so without this guard Enter
              // would send the literal "/name" text before the palette ever
              // gets a chance to select it.
              if (paletteOpen) {
                event.preventDefault();
                return;
              }
              // Enter sends; Shift+Enter inserts a newline.
              if (!event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
            placeholder={t('Ask Zobi about your data...')}
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={busy}
          />
          <VoiceInput
            onTranscript={insertTranscript}
            onError={setError}
            disabled={busy}
          />
          {busy ? (
            <Button
              aria-label={t('Stop')}
              tooltip={t('Stop generating')}
              icon={<Icons.StopOutlined />}
              onClick={() => {
                abortRef.current?.();
                setBusy(false);
              }}
            />
          ) : (
            <Button
              buttonStyle="primary"
              // Also disabled while the palette is open: a click here should
              // not be able to send the literal "/name" text either, for the
              // same reason Enter is guarded above.
              disabled={!draft.trim() || attachments.uploading || paletteOpen}
              aria-label={t('Send')}
              tooltip={
                attachments.uploading
                  ? t('Waiting for attachments to finish uploading')
                  : t('Send')
              }
              icon={<Icons.SendOutlined />}
              onClick={() => send(draft)}
            />
          )}
        </ComposerRow>
      </Composer>
    </Wrapper>
  );
};

export default ChatPanel;
