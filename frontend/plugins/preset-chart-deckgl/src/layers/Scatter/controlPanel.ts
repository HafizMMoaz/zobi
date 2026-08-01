import { ControlPanelConfig } from '@zobi-ui/chart-controls';
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
  legendFormat,
  legendPosition,
  viewport,
  spatial,
  pointRadiusFixed,
  multiplier,
  mapboxStyle,
  maplibreStyle,
  mapProvider,
  generateDeckGLColorSchemeControls,
  tooltipContents,
  tooltipTemplate,
} from '../../utilities/Shared_DeckGL';

const config: ControlPanelConfig = {
  onInit: controlState => ({
    ...controlState,
    time_grain_sqla: {
      ...controlState.time_grain_sqla,
      value: null,
    },
    granularity: {
      ...controlState.granularity,
      value: null,
    },
  }),
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [spatial, null],
        ['row_limit', filterNulls],
        ['adhoc_filters'],
        [tooltipContents],
        [tooltipTemplate],
      ],
    },
    {
      label: t('Map'),
      expanded: true,
      controlSetRows: [
        [mapProvider],
        [mapboxStyle],
        [maplibreStyle],
        [autozoom, viewport],
      ],
    },
    {
      label: t('Point Size'),
      controlSetRows: [
        [pointRadiusFixed],
        [
          {
            name: 'point_unit',
            config: {
              type: 'SelectControl',
              label: t('Point Unit'),
              default: 'square_m',
              clearable: false,
              choices: [
                ['square_m', t('Square meters')],
                ['square_km', t('Square kilometers')],
                ['square_miles', t('Square miles')],
                ['radius_m', t('Radius in meters')],
                ['radius_km', t('Radius in kilometers')],
                ['radius_miles', t('Radius in miles')],
              ],
              description: t(
                'The unit of measure for the specified point radius',
              ),
            },
          },
        ],
        [
          {
            name: 'min_radius',
            config: {
              type: 'TextControl',
              label: t('Minimum Radius'),
              isFloat: true,
              validators: [validateNonEmpty],
              renderTrigger: true,
              default: 2,
              description: t(
                'Minimum radius size of the circle, in pixels. As the zoom level changes, this ' +
                  'insures that the circle respects this minimum radius.',
              ),
            },
          },
          {
            name: 'max_radius',
            config: {
              type: 'TextControl',
              label: t('Maximum Radius'),
              isFloat: true,
              validators: [validateNonEmpty],
              renderTrigger: true,
              default: 250,
              description: t(
                'Maximum radius size of the circle, in pixels. As the zoom level changes, this ' +
                  'insures that the circle respects this maximum radius.',
              ),
            },
          },
        ],
        [multiplier, null],
      ],
    },
    {
      label: t('Point Color'),
      controlSetRows: [
        [legendPosition],
        [legendFormat],
        ...generateDeckGLColorSchemeControls({}),
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
