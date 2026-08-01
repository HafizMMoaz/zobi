import { ControlPanelConfig } from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';

const config: ControlPanelConfig = {
  controlPanelSections: [
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
        ],
      ],
    },
  ],
};

export default config;
