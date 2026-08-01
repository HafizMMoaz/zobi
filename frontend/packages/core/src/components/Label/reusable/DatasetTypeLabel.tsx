import { Icons } from '@zobi.dev/core/components/Icons';
import { t } from '@zobi.dev/extension-api/translation';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { Label } from '..';

// Define the prop types for DatasetTypeLabel
interface DatasetTypeLabelProps {
  datasetType: 'physical' | 'virtual' | 'semantic_view';
}

const SIZE = 's'; // Define the size as a constant

export const DatasetTypeLabel: React.FC<DatasetTypeLabelProps> = ({
  datasetType,
}) => {
  const theme = useTheme();
  if (datasetType === 'semantic_view') {
    return (
      <Label
        icon={
          <Icons.ApartmentOutlined
            iconSize={SIZE}
            iconColor={theme.colorInfo}
          />
        }
        type="info"
        style={{ color: theme.colorInfo }}
      >
        {t('Semantic')}
      </Label>
    );
  }
  const isPhysical = datasetType === 'physical';
  const label: string = isPhysical ? t('Physical') : t('Virtual');
  const labelType = isPhysical ? 'primary' : 'default';

  const color = isPhysical
    ? (theme.labelDatasetPhysicalColor ?? theme.colorPrimaryText)
    : (theme.labelDatasetVirtualColor ?? theme.colorPrimary);
  const bg = isPhysical
    ? theme.labelDatasetPhysicalBg
    : theme.labelDatasetVirtualBg;
  const borderColor = isPhysical
    ? theme.labelDatasetPhysicalBorderColor
    : theme.labelDatasetVirtualBorderColor;
  const iconColor = isPhysical
    ? (theme.labelDatasetPhysicalIconColor ?? theme.colorPrimary)
    : theme.labelDatasetVirtualIconColor;

  const icon = isPhysical ? (
    <Icons.InsertRowAboveOutlined iconSize={SIZE} iconColor={iconColor} />
  ) : (
    <Icons.ConsoleSqlOutlined
      iconSize={SIZE}
      {...(iconColor && { iconColor })}
    />
  );

  return (
    <Label
      icon={icon}
      type={labelType}
      data-test="dataset-type-label"
      style={{
        color,
        ...(bg && { backgroundColor: bg }),
        ...(borderColor && { borderColor }),
      }}
    >
      {label}
    </Label>
  );
};
