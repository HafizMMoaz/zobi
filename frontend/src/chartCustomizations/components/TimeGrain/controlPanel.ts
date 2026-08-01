import { ControlPanelConfig } from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';

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
              label: t('Customization value is required'),
              default: false,
              renderTrigger: true,
              description: t(
                'User must select a value before applying the customization',
              ),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
