import { t } from '@zobi.dev/extension-api/translation';
import { ControlPanelConfig, sharedControls } from '@zobi.dev/chart-controls';
import { SingleValueType } from './SingleValueType';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'groupby',
            config: {
              ...sharedControls.groupby,
              label: t('Column'),
              required: true,
            },
          },
        ],
      ],
    },
    {
      label: t('UI Configuration'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'enableEmptyFilter',
            config: {
              type: 'CheckboxControl',
              label: t('Filter value is required'),
              default: false,
              renderTrigger: true,
              description: t(
                'User must select a value before applying the filter',
              ),
            },
          },
          {
            name: 'enableSingleValue',
            config: {
              type: 'CheckboxControl',
              label: t('Single value'),
              default: SingleValueType.Exact,
              renderTrigger: true,
              description: t('Use only a single value.'),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
