import { useMemo } from 'react';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { Button, Divider, Dropdown } from '@zobi.dev/core/components';
import { Menu, MenuItemType } from '@zobi.dev/core/components/Menu';
import { Icons } from '@zobi.dev/core/components/Icons';
import { commands, menus } from 'src/core';

export interface PanelToolbarProps {
  viewId: string;
  defaultPrimaryActions?: React.ReactNode;
  defaultSecondaryActions?: MenuItemType[];
}

const PanelToolbar = ({
  viewId,
  defaultPrimaryActions,
  defaultSecondaryActions,
}: PanelToolbarProps) => {
  const theme = useTheme();
  const menu = menus.getMenu(viewId);

  const primaryItems = menu?.primary || [];
  const secondaryItems = menu?.secondary || [];

  const extensionPrimaryActions = useMemo(
    () =>
      primaryItems
        .map(item => {
          const command = commands.getCommand(item.command)!;
          if (!command?.icon) {
            return null;
          }
          const Icon =
            (Icons as Record<string, typeof Icons.FileOutlined>)[
              command.icon
            ] ?? Icons.FileOutlined;

          return (
            <Button
              key={item.view}
              onClick={() => commands.executeCommand(command?.id)}
              tooltip={command?.description ?? command?.title}
              icon={<Icon iconSize="m" />}
              buttonSize="small"
              aria-label={command?.title}
              variant="text"
              color="default"
            />
          );
        })
        .filter(Boolean),
    [primaryItems],
  );

  const secondaryActions = useMemo(
    () =>
      secondaryItems
        .map(item => {
          const command = commands.getCommand(item.command)!;
          if (!command) {
            return null;
          }
          return {
            key: command.id,
            label: command.title,
            title: command.description,
            onClick: () => commands.executeCommand(command.id),
          } as MenuItemType;
        })
        .filter(Boolean)
        .concat(defaultSecondaryActions || []),
    [secondaryItems, defaultSecondaryActions],
  );

  const hasPrimaryActions =
    !!defaultPrimaryActions || extensionPrimaryActions.length > 0;
  const hasSecondaryActions = secondaryActions.length > 0;

  // If no actions at all, render nothing
  if (!hasPrimaryActions && !hasSecondaryActions) {
    return null;
  }

  const toolbarStyles = css`
    display: flex;
    align-items: center;
    gap: ${theme.sizeUnit}px;

    & .ant-divider {
      height: ${theme.sizeUnit * 6}px;
      margin: 0;
    }

    & .zobi-button {
      margin-left: 0 !important;
      min-width: ${theme.sizeUnit * 8}px;
    }
  `;

  return (
    <div css={toolbarStyles}>
      {hasPrimaryActions && (
        <>
          {defaultPrimaryActions}
          {extensionPrimaryActions}
        </>
      )}
      {hasPrimaryActions && hasSecondaryActions && <Divider type="vertical" />}
      {hasSecondaryActions && (
        <Dropdown
          popupRender={() => (
            <Menu
              css={css`
                & .ant-dropdown-menu-title-content > div {
                  gap: ${theme.sizeUnit * 4}px;
                }
              `}
              items={secondaryActions}
            />
          )}
          trigger={['click']}
        >
          <Button
            showMarginRight={false}
            color="default"
            variant="text"
            css={css`
              padding: 8px;
            `}
          >
            <Icons.MoreOutlined />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export default PanelToolbar;
