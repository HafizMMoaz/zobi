import { t } from '@zobi.dev/extension-api/translation';

import { ControlSubSectionHeader } from '../components/ControlSubSectionHeader';
import { ControlPanelSectionConfig } from '../types';
import { formatSelectOptions } from '../utils';

export const TITLE_MARGIN_OPTIONS: number[] = [
  0, 15, 30, 40, 50, 75, 100, 125, 150, 200,
];
export const TITLE_POSITION_OPTIONS: [string, string][] = [
  ['Left', t('Left')],
  ['Top', t('Top')],
];

export const titleControls: ControlPanelSectionConfig = {
  label: t('Chart Title'),
  tabOverride: 'customize',
  expanded: true,
  controlSetRows: [
    [<ControlSubSectionHeader>{t('X Axis')}</ControlSubSectionHeader>],
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
        name: 'x_axis_title_margin',
        config: {
          type: 'SelectControl',
          freeForm: true,
          clearable: true,
          label: t('X Axis Title Margin'),
          renderTrigger: true,
          default: TITLE_MARGIN_OPTIONS[3],
          choices: formatSelectOptions(TITLE_MARGIN_OPTIONS),
        },
      },
    ],
    [<ControlSubSectionHeader>{t('Y Axis')}</ControlSubSectionHeader>],
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
        name: 'y_axis_title_margin',
        config: {
          type: 'SelectControl',
          freeForm: true,
          clearable: true,
          label: t('Y Axis Title Margin'),
          renderTrigger: true,
          default: TITLE_MARGIN_OPTIONS[4],
          choices: formatSelectOptions(TITLE_MARGIN_OPTIONS),
        },
      },
    ],
    [
      {
        name: 'y_axis_title_position',
        config: {
          type: 'SelectControl',
          freeForm: true,
          clearable: false,
          label: t('Y Axis Title Position'),
          renderTrigger: true,
          default: TITLE_POSITION_OPTIONS[0][0],
          choices: TITLE_POSITION_OPTIONS,
        },
      },
    ],
  ],
};
