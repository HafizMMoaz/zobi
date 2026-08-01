import {
  ControlPanelConfig,
  getStandardizedControls,
} from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import { validateNonEmpty } from '@zobi.dev/core';
import {
  autozoom,
  filterNulls,
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

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [spatial],
        ['row_limit'],
        ['size'],
        [filterNulls],
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
        [
          {
            name: 'cellSize',
            config: {
              type: 'TextControl',
              label: t('Cell Size'),
              default: 300,
              isInt: true,
              description: t('The size of each cell in meters'),
              renderTrigger: true,
              clearable: false,
            },
          },
        ],
        [
          {
            name: 'aggregation',
            config: {
              type: 'SelectControl',
              label: t('Aggregation'),
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
              ],
            },
          },
        ],
        [
          {
            name: 'contours',
            config: {
              type: 'ContourControl',
              label: t('Contours'),
              renderTrigger: true,
              description: t(
                'Define contour layers. Isolines represent a collection of line segments that ' +
                  'serparate the area above and below a given threshold. Isobands represent a ' +
                  'collection of polygons that fill the are containing values in a given ' +
                  'threshold range.',
              ),
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
  controlOverrides: {
    size: {
      label: t('Weight'),
      description: t("Metric used as a weight for the grid's coloring"),
      validators: [validateNonEmpty],
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    size: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
