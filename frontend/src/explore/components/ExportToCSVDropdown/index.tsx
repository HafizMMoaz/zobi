import { ReactChild, useCallback, Key } from 'react';

import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Dropdown } from '@zobi.dev/core/components';

enum MenuKeys {
  ExportOriginal = 'export_original',
  ExportPivoted = 'export_pivoted',
}

interface ExportToCSVButtonProps {
  exportCSVOriginal: () => void;
  exportCSVPivoted: () => void;
  children: ReactChild;
}

const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  span[role='img'] {
    font-size: ${({ theme }) => theme.fontSizeLG}px;
    margin-left: ${({ theme }) => theme.sizeUnit * 4}px;
  }
`;

export const ExportToCSVDropdown = ({
  exportCSVOriginal,
  exportCSVPivoted,
  children,
}: ExportToCSVButtonProps) => {
  const handleMenuClick = useCallback(
    ({ key }: { key: Key }) => {
      switch (key) {
        case MenuKeys.ExportOriginal:
          exportCSVOriginal();
          break;
        case MenuKeys.ExportPivoted:
          exportCSVPivoted();
          break;
        default:
          break;
      }
    },
    [exportCSVPivoted, exportCSVOriginal],
  );

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        onClick: handleMenuClick,
        selectable: false,
        items: [
          {
            key: MenuKeys.ExportOriginal,
            label: (
              <MenuItemContent>
                {t('Original')}
                <Icons.DownloadOutlined />
              </MenuItemContent>
            ),
          },
          {
            key: MenuKeys.ExportPivoted,
            label: (
              <MenuItemContent>
                {t('Pivoted')}
                <Icons.DownloadOutlined />
              </MenuItemContent>
            ),
          },
        ],
      }}
    >
      {children}
    </Dropdown>
  );
};
