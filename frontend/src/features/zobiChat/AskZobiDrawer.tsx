import { FunctionComponent, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { Button, Drawer } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import ChatPanel from './ChatPanel';

const DrawerBody = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TriggerButton = styled(Button)`
  ${({ theme }) => css`
    margin-right: ${theme.sizeUnit * 2}px;
  `}
`;

/**
 * The "Ask Zobi" entry point that sits in the navigation bar.
 *
 * A drawer rather than a route so the conversation opens over whatever the
 * user is already looking at: asking about a dashboard should not mean
 * navigating away from it.
 *
 * The panel is mounted only while open. Keeping it alive in the background
 * would hold an SSE connection open on every page.
 */
const AskZobiDrawer: FunctionComponent = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TriggerButton buttonStyle="tertiary" onClick={() => setOpen(true)}>
        <Icons.CommentOutlined /> {t('Ask Zobi')}
      </TriggerButton>
      <Drawer
        title={t('Zobi')}
        placement="right"
        width={480}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
        styles={{ body: { padding: 0, height: '100%' } }}
      >
        <DrawerBody>{open && <ChatPanel />}</DrawerBody>
      </Drawer>
    </>
  );
};

export default AskZobiDrawer;
