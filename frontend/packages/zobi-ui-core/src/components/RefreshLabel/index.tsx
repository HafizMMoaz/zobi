import { MouseEventHandler, forwardRef } from 'react';
import { ZobiTheme } from '@zobi/core-legacy/theme';
import { Icons } from '@zobi-ui/core/components/Icons';
import type { IconType } from '@zobi-ui/core/components/Icons/types';
import { Tooltip } from '../Tooltip';

export interface RefreshLabelProps {
  onClick: MouseEventHandler<HTMLSpanElement>;
  tooltipContent: string;
  disabled?: boolean;
}

const RefreshLabel = ({
  onClick,
  tooltipContent,
  disabled,
}: RefreshLabelProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const IconWithoutRef = forwardRef((props: IconType, ref: any) => (
    <Icons.SyncOutlined iconSize="l" {...props} />
  ));

  return (
    <Tooltip title={tooltipContent}>
      <IconWithoutRef
        role="button"
        onClick={disabled ? undefined : onClick}
        css={(theme: ZobiTheme) => ({
          cursor: 'pointer',
          color: theme.colorIcon,
          '&:hover': { color: theme.colorPrimary },
        })}
      />
    </Tooltip>
  );
};

export default RefreshLabel;
