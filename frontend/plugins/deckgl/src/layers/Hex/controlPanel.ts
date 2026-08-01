import {
  ControlPanelConfig,
  getStandardizedControls,
} from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import {
  autozoom,
  extruded,
  filterNulls,
  generateDeckGLColorSchemeControls,
  gridSize,
  jsColumns,
  jsDataMutator,
  jsOnclickHref,
  jsTooltip,
  mapboxStyle,
  maplibreStyle,
  mapProvider,
  spatial,
  viewport,
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
        ...generateDeckGLColorSchemeControls({
          defaultSchemeType: COLOR_SCHEME_TYPES.categorical_palette,
          disableCategoricalColumn: true,
        }),
        [viewport],
        [autozoom],
        [gridSize],
        [extruded],
        [
          {
            name: 'js_agg_function',
            config: {
              type: 'SelectControl',
              label: t('Dynamic Aggregation Function'),
              description: t(
                'The function to use when aggregating points into groups',
              ),
              default: 'sum',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['sum', t('sum')],
                ['min', t('min')],
                ['max', t('max')],
                ['mean', t('mean')],
                ['median', t('median')],
                ['count', t('count')],
                ['variance', t('variance')],
                ['deviation', t('deviation')],
                ['p1', t('p1')],
                ['p5', t('p5')],
                ['p95', t('p95')],
                ['p99', t('p99')],
              ],
            },
          },
        ],
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
  formDataOverrides: formData => ({
    ...formData,
    size: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
