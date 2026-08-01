import {
  ControlPanelConfig,
  getStandardizedControls,
} from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';
import { validateNonEmpty } from '@zobi-ui/core';
import timeGrainSqlaAnimationOverrides from '../../utilities/controls';
import {
  filterNulls,
  autozoom,
  jsColumns,
  jsDataMutator,
  jsTooltip,
  jsOnclickHref,
  gridSize,
  viewport,
  spatial,
  mapboxStyle,
  maplibreStyle,
  mapProvider,
  deckGLFixedColor,
  deckGLCategoricalColorSchemeSelect,
  deckGLCategoricalColorSchemeTypeSelect,
  tooltipContents,
  tooltipTemplate,
} from '../../utilities/Shared_DeckGL';
import { COLOR_SCHEME_TYPES } from '../../utilities/utils';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [spatial],
        ['size'],
        ['row_limit'],
        [filterNulls],
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
      label: t('Grid'),
      expanded: true,
      controlSetRows: [
        [gridSize],
        [
          {
            name: 'color_scheme_type',
            config: {
              ...deckGLCategoricalColorSchemeTypeSelect.config,
              choices: [
                ['default', 'Default'],
                [COLOR_SCHEME_TYPES.fixed_color, t('Fixed color')],
                [
                  COLOR_SCHEME_TYPES.categorical_palette,
                  t('Categorical palette'),
                ],
              ],
              default: 'default',
            },
          },
        ],
        [deckGLFixedColor],
        [deckGLCategoricalColorSchemeSelect],
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
      label: t('Weight'),
      description: t("Metric used as a weight for the grid's coloring"),
      validators: [validateNonEmpty],
    },
    time_grain_sqla: timeGrainSqlaAnimationOverrides,
  },
  formDataOverrides: formData => ({
    ...formData,
    size: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
