import { t } from '@zobi/core/translation';
import { validateNonEmpty } from '@zobi-ui/core';
import {
  ControlPanelConfig,
  getStandardizedControls,
  sections,
} from '@zobi-ui/chart-controls';

export const controlPanel: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metrics'],
        ['adhoc_filters'],
        ['groupby'],
        ['limit'],
        [
          {
            name: 'column_collection',
            config: {
              type: 'CollectionControl',
              label: t('Time series columns'),
              renderTrigger: true,
              validators: [validateNonEmpty],
              controlName: 'TimeSeriesColumnControl',
            },
          },
        ],
        ['row_limit'],
        [
          {
            name: 'url',
            config: {
              type: 'TextControl',
              label: t('URL'),
              description: t(
                "Templated link, it's possible to include {{ metric }} " +
                  'or other values coming from the controls.',
              ),
              default: '',
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    groupby: {
      multiple: false,
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    groupby: getStandardizedControls().popAllColumns(),
    metrics: getStandardizedControls().popAllMetrics(),
  }),
};
