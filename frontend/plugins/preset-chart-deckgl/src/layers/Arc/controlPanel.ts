import { ControlPanelConfig } from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';
import { validateNonEmpty, legacyValidateInteger } from '@zobi-ui/core';
import timeGrainSqlaAnimationOverrides, {
  columnChoices,
  PRIMARY_COLOR,
} from '../../utilities/controls';
import {
  COLOR_SCHEME_TYPES,
  formatSelectOptions,
  isColorSchemeTypeVisible,
} from '../../utilities/utils';
import {
  filterNulls,
  autozoom,
  jsColumns,
  jsDataMutator,
  jsTooltip,
  jsOnclickHref,
  legendFormat,
  legendPosition,
  viewport,
  mapboxStyle,
  maplibreStyle,
  mapProvider,
  tooltipContents,
  tooltipTemplate,
  deckGLCategoricalColor,
  deckGLCategoricalColorSchemeSelect,
  deckGLCategoricalColorSchemeTypeSelect,
} from '../../utilities/Shared_DeckGL';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'start_spatial',
            config: {
              type: 'SpatialControl',
              label: t('Start Longitude & Latitude'),
              validators: [validateNonEmpty],
              description: t('Point to your spatial columns'),
              mapStateToProps: state => ({
                choices: columnChoices(state.datasource),
              }),
            },
          },
          {
            name: 'end_spatial',
            config: {
              type: 'SpatialControl',
              label: t('End Longitude & Latitude'),
              validators: [validateNonEmpty],
              description: t('Point to your spatial columns'),
              mapStateToProps: state => ({
                choices: columnChoices(state.datasource),
              }),
            },
          },
        ],
        ['row_limit', filterNulls],
        ['adhoc_filters'],
        [tooltipContents],
        [tooltipTemplate],
      ],
    },
    {
      label: t('Map'),
      controlSetRows: [
        [mapProvider],
        [mapboxStyle],
        [maplibreStyle],
        [autozoom, viewport],
      ],
    },
    {
      label: t('Arc'),
      controlSetRows: [
        [
          {
            name: 'color_scheme_type',
            config: {
              ...deckGLCategoricalColorSchemeTypeSelect.config,
              choices: [
                [COLOR_SCHEME_TYPES.fixed_color, t('Fixed color')],
                [
                  COLOR_SCHEME_TYPES.categorical_palette,
                  t('Categorical palette'),
                ],
              ],
              default: COLOR_SCHEME_TYPES.fixed_color,
            },
          },
        ],
        [
          {
            name: 'color_picker',
            config: {
              label: t('Source Color'),
              description: t('Color of the source location'),
              type: 'ColorPickerControl',
              default: PRIMARY_COLOR,
              renderTrigger: true,
              visibility: ({ controls }) =>
                isColorSchemeTypeVisible(
                  controls,
                  COLOR_SCHEME_TYPES.fixed_color,
                ),
            },
          },
          {
            name: 'target_color_picker',
            config: {
              label: t('Target Color'),
              description: t('Color of the target location'),
              type: 'ColorPickerControl',
              default: PRIMARY_COLOR,
              renderTrigger: true,
              visibility: ({ controls }) =>
                isColorSchemeTypeVisible(
                  controls,
                  COLOR_SCHEME_TYPES.fixed_color,
                ),
            },
          },
        ],
        [deckGLCategoricalColor],
        [deckGLCategoricalColorSchemeSelect],
        [
          {
            name: 'stroke_width',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Stroke Width'),
              validators: [legacyValidateInteger],
              default: null,
              renderTrigger: true,
              choices: formatSelectOptions([1, 2, 3, 4, 5]),
            },
          },
        ],
        [legendPosition],
        [legendFormat],
      ],
    },
    {
      label: t('Advanced'),
      controlSetRows: [
        [jsColumns],
        [jsDataMutator],
        [jsTooltip],
        [jsOnclickHref],
      ],
    },
  ],
  controlOverrides: {
    size: {
      validators: [],
    },
    time_grain_sqla: timeGrainSqlaAnimationOverrides,
  },
};

export default config;
