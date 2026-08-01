import { t } from '@zobi.dev/extension-api/translation';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Button } from '@zobi.dev/core/components';

interface SaveDatasetActionButtonProps {
  setShowSave: (arg0: boolean) => void;
  onSaveAsExplore?: () => void;
}

const SaveDatasetActionButton = ({
  setShowSave,
  onSaveAsExplore,
}: SaveDatasetActionButtonProps) => (
  <>
    <Button
      color="default"
      variant="text"
      onClick={() => setShowSave(true)}
      icon={<Icons.SaveOutlined />}
      tooltip={t('Save query')}
      aria-label={t('Save')}
    />
    {onSaveAsExplore && (
      <Button
        color="default"
        variant="text"
        onClick={() => onSaveAsExplore?.()}
        icon={<Icons.TableOutlined />}
        tooltip={t('Save or Overwrite Dataset')}
        aria-label={t('Save dataset')}
      />
    )}
  </>
);

export default SaveDatasetActionButton;
