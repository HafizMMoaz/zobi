import { useEffect, useState, FunctionComponent } from 'react';

import { t } from '@zobi/core-legacy/translation';
import { styled, css, useTheme } from '@zobi/core-legacy/theme';
import { Dayjs } from 'dayjs';
import { extendedDayjs } from '../../utils/dates';
import 'dayjs/plugin/updateLocale';
import 'dayjs/plugin/calendar';
import { Icons } from '../Icons';
import type { LastUpdatedProps } from './types';

const REFRESH_INTERVAL = 60000; // every minute

extendedDayjs.updateLocale('en', {
  calendar: {
    lastDay: '[Yesterday at] LTS',
    sameDay: '[Today at] LTS',
    nextDay: '[Tomorrow at] LTS',
    lastWeek: '[last] dddd [at] LTS',
    nextWeek: 'dddd [at] LTS',
    sameElse: 'L',
  },
});

const TextStyles = styled.span`
  color: ${({ theme }) => theme.colorText};
`;

export const LastUpdated: FunctionComponent<LastUpdatedProps> = ({
  updatedAt,
  update,
}) => {
  const theme = useTheme();
  const [timeSince, setTimeSince] = useState<Dayjs>(extendedDayjs(updatedAt));

  useEffect(() => {
    setTimeSince(() => extendedDayjs(updatedAt));

    // update UI every minute in case day changes
    const interval = setInterval(() => {
      setTimeSince(() => extendedDayjs(updatedAt));
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [updatedAt]);

  return (
    <TextStyles>
      {t('Last Updated %s', timeSince.isValid() ? timeSince.calendar() : '--')}
      {update && (
        <Icons.SyncOutlined
          css={css`
            margin-left: ${theme.sizeUnit * 2}px;
          `}
          onClick={update}
        />
      )}
    </TextStyles>
  );
};

export type { LastUpdatedProps };
