import { t } from '@zobi/core/translation';
import { validateNonEmpty } from '@zobi-ui/core';
import type {
  ControlPanelConfig,
  ControlPanelState,
} from '@zobi-ui/chart-controls';
import { formatSelectOptions } from 'src/explore/exploreUtils';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Code'),
      controlSetRows: [
        [
          {
            name: 'markup_type',
            config: {
              type: 'SelectControl',
              label: t('Markup type'),
              clearable: false,
              choices: formatSelectOptions(['markdown', 'html']),
              default: 'markdown',
              validators: [validateNonEmpty],
              description: t('Pick your favorite markup language'),
            },
          },
        ],
        [
          {
            name: 'code',
            config: {
              type: 'TextAreaControl',
              label: t('Code'),
              description: t('Put your code here'),
              mapStateToProps: (state: Partial<ControlPanelState>) => {
                const languageValue = state.controls?.markup_type?.value;
                return {
                  language:
                    typeof languageValue === 'string'
                      ? languageValue
                      : 'markdown',
                };
              },
              default: '',
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    code: {
      default:
        '####Section Title\n' +
        'A paragraph describing the section ' +
        'of the dashboard, right before the separator line ' +
        '\n\n' +
        '---------------',
    },
  },
  sectionOverrides: {
    sqlaTimeSeries: {
      controlSetRows: [],
    },
  },
};

export default config;
