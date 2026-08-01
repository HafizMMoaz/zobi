
import { useState, useCallback } from 'react';
import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import { Popover, Tooltip } from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import copyTextToClipboard from 'src/utils/copy';

const StackTraceContainer = styled.div`
  max-width: 600px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.sizeUnit}px
    ${({ theme }) => theme.sizeUnit * 2}px;
  border-bottom: 1px solid ${({ theme }) => theme.colorBorder};
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.sizeUnit / 2}px;
  color: ${({ theme }) => theme.colorTextSecondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizeUnit / 2}px;
  font-size: ${({ theme }) => theme.fontSizeSM}px;

  &:hover {
    color: ${({ theme }) => theme.colorText};
  }
`;

const StackTraceContent = styled.div`
  overflow: auto;
  padding: ${({ theme }) => theme.sizeUnit * 2}px;
  flex: 1;
`;

const StackTrace = styled.pre`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: ${({ theme }) => theme.fontFamilyCode};
`;

const ErrorIconWrapper = styled.span`
  cursor: pointer;
  color: ${({ theme }) => theme.colorError};

  &:hover {
    opacity: 0.8;
  }
`;

interface TaskStackTracePopoverProps {
  stackTrace: string;
}

export default function TaskStackTracePopover({
  stackTrace,
}: TaskStackTracePopoverProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addDangerToast } = useToasts();

  const handleCopy = useCallback(() => {
    copyTextToClipboard(() => Promise.resolve(stackTrace))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        addDangerToast(t('Failed to copy stack trace to clipboard'));
      });
  }, [stackTrace, addDangerToast]);

  const content = (
    <StackTraceContainer>
      <Header>
        <Tooltip title={copied ? t('Copied!') : t('Copy to clipboard')}>
          <CopyButton onClick={handleCopy}>
            {copied ? (
              <Icons.CheckOutlined iconSize="s" />
            ) : (
              <Icons.CopyOutlined iconSize="s" />
            )}
            {t('Copy')}
          </CopyButton>
        </Tooltip>
      </Header>
      <StackTraceContent>
        <StackTrace>{stackTrace}</StackTrace>
      </StackTraceContent>
    </StackTraceContainer>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="leftTop"
      visible={visible}
      onVisibleChange={setVisible}
    >
      <ErrorIconWrapper>
        <Icons.BugOutlined iconSize="l" />
      </ErrorIconWrapper>
    </Popover>
  );
}
