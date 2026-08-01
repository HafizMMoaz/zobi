import { t } from '@zobi/core/translation';
import { ensureIsArray, validateNonEmpty } from '@zobi-ui/core';
import {
  ControlPanelConfig,
  getStandardizedControls,
} from '@zobi-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['groupby'],
        ['columns'],
        ['metric'],
        ['adhoc_filters'],
        ['row_limit'],
        ['sort_by_metric'],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [['y_axis_format', null], ['color_scheme']],
    },
  ],
  controlOverrides: {
    y_axis_format: {
      label: t('Number format'),
      description: t('Choose a number format'),
    },
    groupby: {
      label: t('Source'),
      multi: false,
      validators: [validateNonEmpty],
      description: t('Choose a source'),
    },
    columns: {
      label: t('Target'),
      multi: false,
      validators: [validateNonEmpty],
      description: t('Choose a target'),
    },
  },
  formDataOverrides: formData => {
    const groupby = getStandardizedControls()
      .popAllColumns()
      .filter(col => !ensureIsArray(formData.columns).includes(col));
    return {
      ...formData,
      groupby,
      metric: getStandardizedControls().shiftMetric(),
    };
  },
};

export default config;
