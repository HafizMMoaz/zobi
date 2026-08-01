import { FC } from 'react';
import { t } from '@zobi/core/translation';
import { css, useTheme } from '@zobi/core/theme';
import { extendedDayjs } from '@zobi-ui/core/utils/dates';

interface LastQueriedLabelProps {
  queriedDttm: string | null;
}

const LastQueriedLabel: FC<LastQueriedLabelProps> = ({ queriedDttm }) => {
  const theme = useTheme();

  if (!queriedDttm) {
    return null;
  }

  const parsedDate = extendedDayjs.utc(queriedDttm);
  if (!parsedDate.isValid()) {
    return null;
  }

  const formattedTime = parsedDate.local().format('L LTS');

  return (
    <div
      css={css`
        font-size: ${theme.fontSizeSM}px;
        color: ${theme.colorTextLabel};
        padding: ${theme.sizeUnit / 2}px ${theme.sizeUnit}px;
        text-align: right;
      `}
      data-test="last-queried-label"
    >
      {t('Last queried at')}: {formattedTime}
    </div>
  );
};

export default LastQueriedLabel;
