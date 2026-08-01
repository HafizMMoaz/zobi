
import { t } from '@zobi/core/translation';
import { css, useTheme } from '@zobi/core/theme';
import { Dropdown, Tooltip } from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';

interface DownloadDropdownProps {
  onDownloadCSV: () => void;
  onDownloadXLSX: () => void;
}

const DownloadDropdown = ({
  onDownloadCSV,
  onDownloadXLSX,
}: DownloadDropdownProps) => {
  const theme = useTheme();
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        onClick: ({ key }) => {
          if (key === 'csv') {
            onDownloadCSV();
          } else if (key === 'xlsx') {
            onDownloadXLSX();
          }
        },
        items: [
          {
            key: 'csv',
            label: t('Export to CSV'),
            icon: <Icons.FileOutlined />,
          },
          {
            key: 'xlsx',
            label: t('Export to Excel'),
            icon: <Icons.FileOutlined />,
          },
        ],
      }}
    >
      <Tooltip title={t('Download')}>
        <span
          tabIndex={0}
          role="button"
          aria-label={t('Download')}
          data-test="drill-detail-download-btn"
        >
          <Icons.DownloadOutlined
            iconColor={theme.colorIcon}
            iconSize="l"
            css={css`
              &.anticon > * {
                line-height: 0;
              }
            `}
          />
        </span>
      </Tooltip>
    </Dropdown>
  );
};

export default DownloadDropdown;
