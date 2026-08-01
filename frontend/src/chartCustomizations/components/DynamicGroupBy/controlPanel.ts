import { ControlPanelConfig } from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';

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
              type: 'SelectControl',
              label: t('Column'),
              description: t('Column to group by'),
              default: null,
              clearable: true,
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
            name: 'canSelectMultiple',
            config: {
              type: 'CheckboxControl',
              label: t('Can select multiple values'),
              default: true,
              renderTrigger: true,
              resetConfig: true,
              affectsDataMask: true,
              description: t('Allow users to select multiple values'),
            },
          },
        ],
        [
          {
            name: 'enableEmptyFilter',
            config: {
              type: 'CheckboxControl',
              label: t('Chart customization value is required'),
              default: false,
              renderTrigger: true,
              description: t(
                'User must select a value before applying the chart customization',
              ),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
