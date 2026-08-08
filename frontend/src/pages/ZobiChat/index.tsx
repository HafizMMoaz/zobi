import { useCallback, useEffect, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { Button, Loading } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Typography } from '@zobi.dev/core/components/Typography';
import SubMenu from 'src/features/home/SubMenu';
import ZobiChat from 'src/features/zobiChat/assistant-ui/ZobiChat';
import {
  deleteConversation,
  fetchConversations,
} from 'src/features/zobiChat/api';
import { Conversation } from 'src/features/zobiChat/types';

const Layout = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 260px 1fr;
    /* Fills the viewport below the nav so only the transcript scrolls. */
    height: calc(100vh - ${theme.sizeUnit * 32}px);
    border-top: 1px solid ${theme.colorBorderSecondary};

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  `}
`;

const Sidebar = styled.div`
  ${({ theme }) => css`
    border-right: 1px solid ${theme.colorBorderSecondary};
    overflow-y: auto;
    padding: ${theme.sizeUnit * 2}px;
    display: flex;
    flex-direction: column;
    gap: ${theme.sizeUnit}px;

    @media (max-width: 768px) {
      display: none;
    }
  `}
`;

const ThreadButton = styled.button<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.sizeUnit}px;
    width: 100%;
    text-align: left;
    cursor: pointer;
    border: none;
    border-radius: ${theme.borderRadius}px;
    padding: ${theme.sizeUnit * 2}px;
    background: ${selected ? theme.colorPrimaryBg : 'transparent'};
    color: ${theme.colorText};
    transition: background-color ${theme.motionDurationMid} ${theme.motionEaseInOut};

    &:hover {
      background: ${selected ? theme.colorPrimaryBg : theme.colorBgTextHover};
    }

    .thread-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `}
`;

function ZobiChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // Drives ZobiChat's remount. Deliberately not derived from `selected`: a new
  // conversation acquires its server id mid-turn (ZobiChat reports it back via
  // onConversationStarted while the SSE stream is still open), and keying the
  // child on `selected` would tear down the streaming instance at that moment
  // and lose the rest of the answer. Only an explicit thread switch bumps this.
  const [mountKey, setMountKey] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setConversations(await fetchConversations());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Switches threads, remounting the chat so no state leaks between them. */
  const selectConversation = (id: number | null) => {
    setSelected(id);
    setMountKey(key => key + 1);
  };

  const handleDelete = async (id: number) => {
    await deleteConversation(id).catch(() => undefined);
    if (selected === id) selectConversation(null);
    refresh();
  };

  return (
    <>
      <SubMenu
        name={t('AI')}
        buttons={[
          {
            name: (
              <>
                <Icons.PlusOutlined /> {t('New chat')}
              </>
            ),
            buttonStyle: 'primary',
            onClick: () => selectConversation(null),
          },
        ]}
      />
      <Layout>
        <Sidebar>
          {loading && <Loading position="inline" />}
          {!loading && !conversations.length && (
            <Typography.Text type="secondary">
              {t('No conversations yet.')}
            </Typography.Text>
          )}
          {conversations.map(conversation => (
            <ThreadButton
              key={conversation.id}
              type="button"
              selected={selected === conversation.id}
              onClick={() => selectConversation(conversation.id)}
            >
              <span className="thread-title">
                {conversation.title || t('Untitled')}
              </span>
              <Button
                buttonStyle="link"
                onClick={event => {
                  // Without this the click also selects the thread being
                  // deleted, which then renders as a missing conversation.
                  event.stopPropagation();
                  handleDelete(conversation.id);
                }}
              >
                <Icons.DeleteOutlined />
              </Button>
            </ThreadButton>
          ))}
        </Sidebar>

        <ZobiChat
          key={mountKey}
          conversationId={selected}
          onConversationStarted={id => {
            // Highlights the new thread in the sidebar. No remount here - the
            // turn that created this conversation is still streaming.
            setSelected(id);
            refresh();
          }}
        />
      </Layout>
    </>
  );
}

export default ZobiChatPage;
