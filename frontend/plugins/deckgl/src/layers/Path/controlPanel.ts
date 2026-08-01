import { ControlPanelConfig } from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import {
  filterNulls,
  autozoom,
  jsColumns,
  jsDataMutator,
  jsTooltip,
  jsOnclickHref,
  viewport,
  lineWidth,
  lineType,
  reverseLongLat,
  mapboxStyle,
  maplibreStyle,
  mapProvider,
  tooltipContents,
  tooltipTemplate,
} from '../../utilities/Shared_DeckGL';
import { dndLineColumn } from '../../utilities/sharedDndControls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [dndLineColumn],
        [
          {
            ...lineType,
            config: {
              ...lineType.config,
              choices: [
                ['polyline', t('Polyline')],
                ['json', t('JSON')],
              ],
            },
          },
        ],
        ['row_limit'],
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
        [viewport],
        ['color_picker'],
        [lineWidth],
        [
          {
            name: 'line_width_unit',
            config: {
              type: 'SelectControl',
              label: t('Line width unit'),
              default: 'meters',
              choices: [
                ['meters', t('meters')],
                ['pixels', t('pixels')],
              ],
              renderTrigger: true,
            },
          },
        ],
        [reverseLongLat],
        [autozoom],
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
};

export default config;
