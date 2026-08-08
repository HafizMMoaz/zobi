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

  const handleDelete = async (id: number) => {
    await deleteConversation(id).catch(() => undefined);
    if (selected === id) setSelected(null);
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
            onClick: () => setSelected(null),
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
              onClick={() => setSelected(conversation.id)}
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
          // Remounts on switch so no state leaks between conversations.
          key={selected ?? 'new'}
          conversationId={selected}
          onConversationStarted={id => {
            setSelected(id);
            refresh();
          }}
        />
      </Layout>
    </>
  );
}

export default ZobiChatPage;
