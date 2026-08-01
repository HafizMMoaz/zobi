import { ZobiTheme, css } from '@zobi/core/theme';
import { ReactElement } from 'react';
import { Tooltip } from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';
import { NotificationMethodOption } from '../types';

const notificationStyledIcon = (theme: ZobiTheme) => css`
  color: ${theme.colorIcon};
  margin-right: ${theme.sizeUnit * 2}px;
  vertical-align: middle;
`;

export default function RecipientIcon({ type }: { type: string }) {
  const recipientIconConfig: { icon: null | ReactElement; label: string } = {
    icon: null,
    label: '',
  };
  switch (type) {
    case NotificationMethodOption.Email:
      recipientIconConfig.icon = (
        <Icons.MailOutlined css={notificationStyledIcon} iconSize="l" />
      );
      recipientIconConfig.label = NotificationMethodOption.Email;
      break;
    case NotificationMethodOption.Slack:
      recipientIconConfig.icon = (
        <Icons.SlackOutlined css={notificationStyledIcon} iconSize="l" />
      );
      recipientIconConfig.label = NotificationMethodOption.Slack;
      break;
    case NotificationMethodOption.SlackV2:
      recipientIconConfig.icon = (
        <Icons.SlackOutlined css={notificationStyledIcon} iconSize="l" />
      );
      recipientIconConfig.label = NotificationMethodOption.Slack;
      break;
    case NotificationMethodOption.Webhook:
      recipientIconConfig.icon = (
        <Icons.ApiOutlined css={notificationStyledIcon} iconSize="l" />
      );
      recipientIconConfig.label = NotificationMethodOption.Webhook;
      break;
    default:
      recipientIconConfig.icon = null;
      recipientIconConfig.label = '';
  }
  return recipientIconConfig.icon ? (
    <Tooltip title={recipientIconConfig.label} placement="bottom">
      {recipientIconConfig.icon}
    </Tooltip>
  ) : null;
}
