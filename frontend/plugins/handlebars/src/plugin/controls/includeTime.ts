import { ControlSetItem } from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import { isAggMode } from './shared';

export const includeTimeControlSetItem: ControlSetItem = {
  name: 'include_time',
  config: {
    type: 'CheckboxControl',
    label: t('Include time'),
    description: t(
      'Whether to include the time granularity as defined in the time section',
    ),
    default: false,
    visibility: isAggMode,
    resetOnHide: false,
  },
};
