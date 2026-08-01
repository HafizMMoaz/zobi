import { Icons } from '@zobi.dev/core/components/Icons';
import { t } from '@zobi.dev/extension-api/translation';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { Label } from '..';

// Define props for the PublishedLabel component
interface PublishedLabelProps {
  isPublished: boolean; // Whether the item is published
  onClick?: () => void; // Optional click handler
}

export const PublishedLabel: React.FC<PublishedLabelProps> = ({
  isPublished,
  onClick,
}) => {
  const theme = useTheme();
  const label = isPublished ? t('Published') : t('Draft');
  const labelType = isPublished ? 'success' : 'primary';

  const color = isPublished
    ? (theme.labelPublishedColor ?? theme.colorSuccessText)
    : (theme.labelDraftColor ?? theme.colorPrimaryText);
  const bg = isPublished ? theme.labelPublishedBg : theme.labelDraftBg;
  const borderColor = isPublished
    ? theme.labelPublishedBorderColor
    : theme.labelDraftBorderColor;
  const iconColor = isPublished
    ? (theme.labelPublishedIconColor ?? theme.colorSuccess)
    : (theme.labelDraftIconColor ?? theme.colorPrimary);

  const icon = isPublished ? (
    <Icons.CheckCircleOutlined iconSize="s" iconColor={iconColor} />
  ) : (
    <Icons.MinusCircleOutlined iconSize="s" iconColor={iconColor} />
  );

  return (
    <Label
      type={labelType}
      icon={icon}
      onClick={onClick}
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
