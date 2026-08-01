
import { useState } from 'react';
import { styled } from '@zobi.dev/extension-api/theme';
import { Popover } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';

const PayloadContainer = styled.div`
  max-width: 400px;
  max-height: 300px;
  overflow: auto;
  padding: ${({ theme }) => theme.sizeUnit * 2}px;
`;

const PayloadPre = styled.pre`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const InfoIconWrapper = styled.span`
  cursor: pointer;
  color: ${({ theme }) => theme.colorIcon};

  &:hover {
    color: ${({ theme }) => theme.colorPrimary};
  }
`;

interface TaskPayloadPopoverProps {
  payload: Record<string, any>;
}

export default function TaskPayloadPopover({
  payload,
}: TaskPayloadPopoverProps) {
  const [visible, setVisible] = useState(false);

  const content = (
    <PayloadContainer>
      <PayloadPre>{JSON.stringify(payload, null, 2)}</PayloadPre>
    </PayloadContainer>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="leftTop"
      visible={visible}
      onVisibleChange={setVisible}
    >
      <InfoIconWrapper>
        <Icons.InfoCircleOutlined iconSize="l" />
      </InfoIconWrapper>
    </Popover>
  );
}
