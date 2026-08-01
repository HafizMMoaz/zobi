import {
  ControlPanelConfig,
  getStandardizedControls,
} from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import { validateNonEmpty } from '@zobi.dev/core';
import {
  filterNulls,
  autozoom,
  jsColumns,
  jsDataMutator,
  jsTooltip,
  jsOnclickHref,
  extruded,
  gridSize,
  viewport,
  spatial,
  mapboxStyle,
  maplibreStyle,
  mapProvider,
  tooltipContents,
  tooltipTemplate,
  legendPosition,
  generateDeckGLColorSchemeControls,
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
        [viewport],
        ...generateDeckGLColorSchemeControls({
          defaultSchemeType: COLOR_SCHEME_TYPES.categorical_palette,
          disableCategoricalColumn: true,
        }),
        [legendPosition],
        [autozoom],
        [gridSize],
        [extruded],
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
      label: t('Height'),
      description: t('Metric used to control height'),
      validators: [validateNonEmpty],
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    size: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
