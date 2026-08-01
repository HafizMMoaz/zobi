import { EmptyState } from '@zobi.dev/core/components';
import { t } from '@zobi.dev/extension-api/translation';

const ExtensionPlaceholder = ({ id }: { id: string }) => (
  <EmptyState
    title={t('The extension %(id)s could not be loaded.', { id })}
    description={t(
      `This may be due to the extension not being activated or the content not being available.`,
    )}
    image="empty.svg"
  />
);

export default ExtensionPlaceholder;
