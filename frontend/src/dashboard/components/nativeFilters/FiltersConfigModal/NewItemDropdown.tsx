import { FC } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { NativeFilterType, ChartCustomizationType } from '@zobi.dev/core';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { Button, Dropdown, Menu } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';

interface Props {
  onAddFilter: (type: NativeFilterType) => void;
  onAddCustomization: (type: ChartCustomizationType) => void;
}

const NewItemDropdown: FC<Props> = ({ onAddFilter, onAddCustomization }) => {
  const theme = useTheme();

  const menu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'filter') {
          onAddFilter(NativeFilterType.NativeFilter);
        } else if (key === 'customization') {
          onAddCustomization(ChartCustomizationType.ChartCustomization);
        } else if (key === 'divider') {
          onAddFilter(NativeFilterType.Divider);
        }
      }}
      items={[
        {
          key: 'filter',
          label: t('Add filter'),
          icon: (
            <Icons.FilterOutlined iconColor={theme.colorPrimary} iconSize="m" />
          ),
        },
        {
          key: 'customization',
          label: t('Add display control'),
          icon: (
            <Icons.SettingOutlined
              iconColor={theme.colorPrimary}
              iconSize="m"
            />
          ),
        },
        {
          key: 'divider',
          label: t('Add divider'),
          icon: (
            <Icons.PicCenterOutlined
              iconColor={theme.colorPrimary}
              iconSize="m"
            />
          ),
        },
      ]}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={['hover']}>
      <Button
        buttonSize="default"
        buttonStyle="secondary"
        icon={
          <Icons.PlusOutlined iconColor={theme.colorPrimary} iconSize="m" />
        }
        data-test="new-item-dropdown-button"
      >
        {t('New')}
      </Button>
    </Dropdown>
  );
};

export default NewItemDropdown;
