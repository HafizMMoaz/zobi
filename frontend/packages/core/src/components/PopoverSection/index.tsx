import { MouseEventHandler, ReactNode } from 'react';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Tooltip } from '../Tooltip';

export interface PopoverSectionProps {
  title: string;
  isSelected?: boolean;
  onSelect?: MouseEventHandler<HTMLDivElement>;
  info?: string;
  children?: ReactNode;
}

export default function PopoverSection({
  title,
  isSelected,
  children,
  onSelect,
  info,
}: PopoverSectionProps) {
  const theme = useTheme();
  return (
    <div
      css={{
        paddingBottom: theme.sizeUnit * 2,
        opacity: isSelected ? 1 : 0.6,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        css={css`
          display: flex;
          align-items: center;
          cursor: ${onSelect ? 'pointer' : 'default'};
        `}
      >
        <strong data-test="popover-title">{title}</strong>
        {info && (
          <Tooltip
            title={info}
            css={css`
              margin-left: ${theme.sizeUnit}px;
              margin-right: ${theme.sizeUnit}px;
            `}
          >
            <Icons.InfoCircleOutlined
              role="img"
              iconSize="s"
              iconColor={theme.colorIcon}
            />
          </Tooltip>
        )}
        <Icons.CheckOutlined
          iconSize="s"
          role="img"
          iconColor={isSelected ? theme.colorPrimary : theme.colorIcon}
        />
      </div>
      <div
        css={css`
          margin-left: ${theme.sizeUnit}px;
          margin-top: ${theme.sizeUnit}px;
        `}
      >
        {children}
      </div>
    </div>
  );
}
