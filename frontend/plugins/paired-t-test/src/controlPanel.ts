import { t } from '@zobi.dev/extension-api/translation';
import { validateNonEmpty } from '@zobi.dev/core';
import { ControlPanelConfig } from '@zobi.dev/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metrics'],
        ['adhoc_filters'],
        [
          {
            name: 'groupby',
            override: {
              validators: [validateNonEmpty],
            },
          },
        ],
        ['limit', 'timeseries_limit_metric'],
        ['order_desc'],
        [
          {
            name: 'contribution',
            config: {
              type: 'CheckboxControl',
              label: t('Contribution'),
              default: false,
              description: t('Compute the contribution to the total'),
            },
          },
        ],
        ['row_limit', null],
      ],
    },
    {
      label: t('Parameters'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'significance_level',
            config: {
              type: 'TextControl',
              label: t('Significance Level'),
              default: 0.05,
              description: t(
                'Threshold alpha level for determining significance',
              ),
            },
          },
        ],
        [
          {
            name: 'pvalue_precision',
            config: {
              type: 'TextControl',
              label: t('p-value precision'),
              default: 6,
              description: t(
                'Number of decimal places with which to display p-values',
              ),
            },
          },
        ],
        [
          {
            name: 'liftvalue_precision',
            config: {
              type: 'TextControl',
              label: t('Lift percent precision'),
              default: 4,
              description: t(
                'Number of decimal places with which to display lift values',
              ),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
