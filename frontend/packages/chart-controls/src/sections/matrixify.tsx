import { t } from '@zobi.dev/extension-api/translation';
import { ControlPanelSectionConfig } from '../types';

export const matrixifyEnableSection: ControlPanelSectionConfig = {
  label: t('Matrixify'),
  expanded: true,
  controlSetRows: [
    [
      {
        name: 'matrixify_enable',
        config: {
          type: 'SwitchControl',
          label: t('Enable matrixify'),
          default: false,
          renderTrigger: true,
        },
      },
    ],
    ['matrixify_mode_columns'],
    ['matrixify_mode_rows'],
  ],
  tabOverride: 'matrixify',
};

export const matrixifySection: ControlPanelSectionConfig = {
  label: t('Cell layout & styling'),
  expanded: false,
  visibility: ({ controls }) =>
    controls?.matrixify_enable?.value === true &&
    (controls?.matrixify_mode_rows?.value === 'metrics' ||
      controls?.matrixify_mode_rows?.value === 'dimensions' ||
      controls?.matrixify_mode_columns?.value === 'metrics' ||
      controls?.matrixify_mode_columns?.value === 'dimensions'),
  controlSetRows: [
    [
      {
        name: 'matrixify_row_height',
        config: {
          type: 'TextControl',
          label: t('Row height'),
          default: 300,
          isInt: true,
          renderTrigger: true,
          description: t('Height of each row in pixels'),
        },
      },
      {
        name: 'matrixify_fit_columns_dynamically',
        config: {
          type: 'CheckboxControl',
          label: t('Fit columns dynamically'),
          default: true,
          renderTrigger: true,
          description: t('Automatically adjust column width based on content'),
        },
      },
    ],
    [
      {
        name: 'matrixify_charts_per_row',
        config: {
          type: 'TextControl',
          label: t('Charts per row'),
          default: 3,
          isInt: true,
          renderTrigger: true,
          description: t(
            'Number of charts per row when not fitting dynamically',
          ),
          visibility: ({ controls }) =>
            !controls?.matrixify_fit_columns_dynamically?.value,
        },
      },
    ],
    [
      {
        name: 'matrixify_cell_title_template',
        config: {
          type: 'TextControl',
          label: t('Cell title template'),
          default: '',
          description: t(
            'Template for cell titles. Use Handlebars templating syntax (a popular templating library that uses double curly brackets for variable substitution): {{row}}, {{column}}, {{rowLabel}}, {{columnLabel}}',
          ),
          placeholder: '{{rowLabel}} by {{colLabel}}',
        },
      },
    ],
  ],
  tabOverride: 'customize',
};

export const matrixifyRowSection: ControlPanelSectionConfig = {
  expanded: false,
  visibility: ({ controls }) =>
    controls?.matrixify_enable?.value === true &&
    (controls?.matrixify_mode_rows?.value === 'metrics' ||
      controls?.matrixify_mode_rows?.value === 'dimensions'),
  controlSetRows: [
    ['matrixify_show_row_labels'],
    ['matrixify_rows'],
    ['matrixify_dimension_rows'],
    ['matrixify_dimension_selection_mode_rows'],
    ['matrixify_topn_value_rows'],
    ['matrixify_topn_metric_rows'],
    ['matrixify_topn_order_rows'],
  ],
  tabOverride: 'matrixify',
};

export const matrixifyColumnSection: ControlPanelSectionConfig = {
  expanded: false,
  visibility: ({ controls }) =>
    controls?.matrixify_enable?.value === true &&
    (controls?.matrixify_mode_columns?.value === 'metrics' ||
      controls?.matrixify_mode_columns?.value === 'dimensions'),
  controlSetRows: [
    ['matrixify_show_column_headers'],
    ['matrixify_columns'],
    ['matrixify_dimension_columns'],
    ['matrixify_dimension_selection_mode_columns'],
    ['matrixify_topn_value_columns'],
    ['matrixify_topn_metric_columns'],
    ['matrixify_topn_order_columns'],
  ],
  tabOverride: 'matrixify',
};
