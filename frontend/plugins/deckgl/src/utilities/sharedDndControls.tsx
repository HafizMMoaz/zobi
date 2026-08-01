
import { t } from '@zobi.dev/extension-api/translation';
import { sharedControls } from '@zobi.dev/chart-controls';

export const dndLineColumn = {
  name: 'line_column',
  config: {
    ...sharedControls.entity,
    label: t('Lines column'),
    description: t('The database columns that contains lines information'),
  },
};

export const dndGeojsonColumn = {
  name: 'geojson',
  config: {
    ...sharedControls.entity,
    label: t('GeoJson Column'),
    description: t('Select the geojson column'),
  },
};
