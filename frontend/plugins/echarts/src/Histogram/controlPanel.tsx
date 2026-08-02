import { t } from '@zobi.dev/extension-api/translation';
import { validateInteger, validateNonEmpty, withLabel } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import {
  ControlPanelConfig,
  formatSelectOptionsForRange,
  dndGroupByControl,
  columnsByType,
  D3_FORMAT_OPTIONS,
  D3_FORMAT_DOCS,
  D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT,
} from '@zobi.dev/chart-controls';
import { showLegendControl, showValueControl } from '../controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'column',
            config: {
              ...dndGroupByControl,
              label: t('Column'),
              multi: false,
              description: t('Numeric column used to calculate the histogram.'),
              validators: [validateNonEmpty],
              freeForm: false,
              disabledTabs: new Set(['saved', 'sqlExpression']),
              mapStateToProps: ({ datasource }) => ({
                options: columnsByType(datasource, GenericDataType.Numeric),
              }),
            },
          },
        ],
        ['groupby'],
        ['adhoc_filters'],
        ['row_limit'],
        [
          {
            name: 'bins',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Bins'),
              default: 5,
              choices: formatSelectOptionsForRange(5, 20, 5),
              description: t('The number of bins for the histogram'),
              validators: [withLabel(validateInteger, t('Bins'))],
            },
          },
        ],
        [
          {
            name: 'normalize',
            config: {
              type: 'CheckboxControl',
              label: t('Normalize'),
              description: t(`
                The normalize option transforms the histogram values into proportions or
                probabilities by dividing each bin's count by the total count of data points.
                This normalization process ensures that the resulting values sum up to 1,
                enabling a relative comparison of the data's distribution and providing a
                clearer understanding of the proportion of data points within each bin.`),
              default: false,
            },
          },
        ],
        [
          {
            name: 'cumulative',
            config: {
              type: 'CheckboxControl',
              label: t('Cumulative'),
              description: t(`
                The cumulative option allows you to see how your data accumulates over different
                values. When enabled, the histogram bars represent the running total of frequencies
                up to each bin. This helps you understand how likely it is to encounter values
                below a certain point. Keep in mind that enabling cumulative doesn't change your
                original data, it just changes the way the histogram is displayed.`),
              default: false,
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['color_scheme'],
        [showValueControl],
        [showLegendControl],
        [
          {
            name: 'x_axis_title',
            config: {
              type: 'TextControl',
              label: t('X Axis Title'),
              renderTrigger: true,
              default: '',
            },
          },
        ],
        [
          {
            name: 'x_axis_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('X Axis Format'),
              renderTrigger: true,
              default: 'SMART_NUMBER',
              choices: D3_FORMAT_OPTIONS,
              description: `${D3_FORMAT_DOCS} ${D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT}`,
            },
          },
        ],
        [
          {
            name: 'y_axis_title',
            config: {
              type: 'TextControl',
              label: t('Y Axis Title'),
              renderTrigger: true,
              default: '',
            },
          },
        ],
        [
          {
            name: 'y_axis_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Y Axis Format'),
              renderTrigger: true,
              default: 'SMART_NUMBER',
              choices: D3_FORMAT_OPTIONS,
              description: `${D3_FORMAT_DOCS} ${D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT}`,
            },
          },
        ],
      ],
    },
  ],
};

export default config;
