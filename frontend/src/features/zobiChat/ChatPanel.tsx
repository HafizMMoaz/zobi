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
  fetchConversation,
  fetchModes,
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
import VoiceInput from './VoiceInput';
import {
  AgentMode,
  ChatMessage,
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
  `}
`;

const RISK_COLOR: Record<string, string> = {
  read: 'default',
  write: 'blue',
  destructive: 'red',
};

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);

  const abortRef = useRef<(() => void) | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

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
      return;
    }
    fetchConversation(conversationId)
      .then(detail => {
        setMessages(detail.messages);
        setMode(detail.mode);
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

      abortRef.current = streamMessage(
        target,
        {
          content: text,
          mode,
          ...(attachmentIds.length ? { attachment_ids: attachmentIds } : {}),
        },
        handleEvent,
        message => {
          setError(message);
          setBusy(false);
        },
      );
    },
    [busy, mode, handleEvent, ensureConversation, attachments],
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
      if (id) updateConversation(id, { mode: next }).catch(() => undefined);
    },
    [id],
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
          <Typography.Text type="secondary">
            {modes.find(option => option.value === mode)?.description}
          </Typography.Text>
        </Space>
        <AttachmentList
          items={attachments.items}
          onRemove={attachments.removeItem}
        />
        <ComposerRow>
          <AttachButton onFiles={attachments.addFiles} disabled={busy} />
          <Input.TextArea
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onPressEnter={event => {
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
              onClick={() => {
                abortRef.current?.();
                setBusy(false);
              }}
            >
              {t('Stop')}
            </Button>
          ) : (
            <Button
              buttonStyle="primary"
              disabled={!draft.trim() || attachments.uploading}
              tooltip={
                attachments.uploading
                  ? t('Waiting for attachments to finish uploading')
                  : undefined
              }
              onClick={() => send(draft)}
            >
              {t('Send')}
            </Button>
          )}
        </ComposerRow>
      </Composer>
    </Wrapper>
  );
};

export default ChatPanel;
