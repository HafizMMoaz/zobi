import { FC, useState, useCallback } from 'react';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { t } from '@zobi.dev/extension-api/translation';
import { Tooltip } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';

export interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
}

export const RefreshButton: FC<RefreshButtonProps> = ({ onRefresh }) => {
  const theme = useTheme();
  const [isSpinning, setIsSpinning] = useState(false);

  const buttonStyles = css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: ${theme.colorTextSecondary};
    transition: color ${theme.motionDurationMid};
    margin-left: ${theme.marginXS}px;
    margin-right: ${theme.marginSM}px;

    &:hover {
      color: ${theme.colorText};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;

  const handleClick = useCallback(() => {
    if (isSpinning) {
      return;
    }
    setIsSpinning(true);
    Promise.resolve(onRefresh()).finally(() => {
      setIsSpinning(false);
    });
  }, [isSpinning, onRefresh]);

  return (
    <Tooltip title={t('Refresh dashboard')} placement="bottom">
      <button
        type="button"
        css={buttonStyles}
        onClick={handleClick}
        aria-label={t('Refresh dashboard')}
        data-test="refresh-button"
        disabled={isSpinning}
      >
        <Icons.SyncOutlined iconSize="l" spin={isSpinning} />
      </button>
    </Tooltip>
  );
};

export default RefreshButton;
