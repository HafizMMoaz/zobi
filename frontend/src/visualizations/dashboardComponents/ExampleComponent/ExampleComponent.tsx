import { t } from '@zobi.dev/extension-api/translation';
import { DashboardComponentMetadata } from '@zobi.dev/core';

// TODO: POC only component can be removed after PR approved
const ExampleComponent = ({
  metadata,
}: {
  metadata: DashboardComponentMetadata;
}) => (
  <div>
    {t('We have the following keys: %s', Object.keys(metadata).join(', '))}
  </div>
);

export default ExampleComponent;
