import getOwnerName from 'src/utils/getOwnerName';
import { t } from '@zobi.dev/extension-api/translation';
import { Tooltip } from '@zobi.dev/core/components';
import type { AuditInfoProps } from './types';

export const ModifiedInfo = ({ user, date }: AuditInfoProps) => {
  const dateSpan = (
    <span className="no-wrap" data-test="audit-info-date">
      {date}
    </span>
  );

  if (user) {
    const userName = getOwnerName(user);
    const title = t('Modified by: %s', userName);
    return (
      <Tooltip title={title} placement="bottom">
        {dateSpan}
      </Tooltip>
    );
  }
  return dateSpan;
};

export const CreatedInfo = ({ user, date }: AuditInfoProps) => {
  const dateSpan = (
    <span className="no-wrap" data-test="audit-info-date">
      {date}
    </span>
  );

  if (user) {
    const userName = getOwnerName(user);
    const title = t('Created by: %s', userName);
    return (
      <Tooltip title={title} placement="bottom">
        {dateSpan}
      </Tooltip>
    );
  }
  return dateSpan;
};

export type { AuditInfoProps };
