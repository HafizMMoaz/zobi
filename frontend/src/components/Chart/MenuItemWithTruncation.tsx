
import { ReactNode, CSSProperties, useCallback } from 'react';
import { truncationCSS, useCSSTextTruncation } from '@zobi-ui/core';
import { css, useTheme } from '@zobi/core/theme';
import { Menu, type ItemType } from '@zobi-ui/core/components/Menu';
import { Flex, Tooltip } from '@zobi-ui/core/components';
import { MenuItemProps } from 'antd';

export type MenuItemWithTruncationProps = {
  tooltipText: ReactNode;
  children: ReactNode;
  onClick?: MenuItemProps['onClick'];
  style?: CSSProperties;
  menuKey?: string;
};

export const TruncatedMenuLabel = ({
  tooltipText,
  children,
}: {
  tooltipText: ReactNode;
  children: ReactNode;
}) => {
  const [ref, isTruncated] = useCSSTextTruncation<HTMLDivElement>();

  return (
    <Tooltip title={isTruncated ? tooltipText : null}>
      <div
        ref={ref}
        css={css`
          max-width: 100%;
          ${truncationCSS};
        `}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export const useMenuItemWithTruncation = () => {
  const getMenuItemWithTruncation = useCallback(
    ({
      tooltipText,
      children,
      onClick,
      style,
      key,
      disabled = false,
      danger = false,
      ...restProps
    }: {
      tooltipText: ReactNode;
      children: ReactNode;
      onClick?: (e: any) => void;
      style?: CSSProperties;
      key: string;
      disabled?: boolean;
      danger?: boolean;
      [key: string]: any;
    }): ItemType => ({
      key,
      onClick,
      style,
      disabled,
      danger,
      label: (
        <TruncatedMenuLabel tooltipText={tooltipText}>
          {children}
        </TruncatedMenuLabel>
      ),
      ...restProps,
    }),
    [],
  );

  return getMenuItemWithTruncation;
};

export const MenuItemWithTruncation = ({
  tooltipText,
  children,
  onClick,
  style,
  menuKey,
}: MenuItemWithTruncationProps) => {
  const [itemRef, itemIsTruncated] = useCSSTextTruncation<HTMLDivElement>();

  return (
    <Menu.Item
      css={css`
        display: flex;
        line-height: 1.5em;
      `}
      key={menuKey}
      onClick={onClick}
      style={style}
    >
      <Tooltip
        title={itemIsTruncated ? tooltipText : null}
        css={css`
          max-width: 200px;
        `}
      >
        <div
          ref={itemRef}
          css={css`
            max-width: 100%;
            ${truncationCSS};
          `}
        >
          {children}
        </div>
      </Tooltip>
    </Menu.Item>
  );
};

export const VirtualizedMenuItem = ({
  tooltipText,
  children,
  onClick,
  style,
}: {
  tooltipText: ReactNode;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
}) => {
  const theme = useTheme();
  const [itemRef, itemIsTruncated] = useCSSTextTruncation<HTMLDivElement>();

  return (
    <Flex
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
      align="center"
      style={style}
      css={css`
        cursor: pointer;
        padding-left: ${theme.paddingXS}px;
        &:hover {
          background-color: ${theme.colorBgTextHover};
        }
        &:active {
          background-color: ${theme.colorBgTextActive};
        }
      `}
    >
      <Tooltip title={itemIsTruncated ? tooltipText : null}>
        <div
          ref={itemRef}
          css={css`
            max-width: 100%;
            ${truncationCSS};
          `}
        >
          {children}
        </div>
      </Tooltip>
    </Flex>
  );
};
