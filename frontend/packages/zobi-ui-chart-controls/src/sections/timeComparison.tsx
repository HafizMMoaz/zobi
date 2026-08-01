import { t } from '@zobi/core/translation';
import { ComparisonType } from '@zobi-ui/core';

import {
  ControlPanelSectionConfig,
  ControlPanelState,
  ControlState,
} from '../types';
import { INVALID_DATE } from '..';

const fullChoices = [
  ['1 day ago', t('1 day ago')],
  ['1 week ago', t('1 week ago')],
  ['28 days ago', t('28 days ago')],
  ['30 days ago', t('30 days ago')],
  ['1 month ago', t('1 month ago')],
  ['52 weeks ago', t('52 weeks ago')],
  ['1 year ago', t('1 year ago')],
  ['104 weeks ago', t('104 weeks ago')],
  ['2 years ago', t('2 years ago')],
  ['156 weeks ago', t('156 weeks ago')],
  ['3 years ago', t('3 years ago')],
  ['custom', t('Custom date')],
  ['inherit', t('Inherit range from time filter')],
];

const reducedKeys = new Set([
  '1 day ago',
  '1 week ago',
  '1 month ago',
  '1 year ago',
  'custom',
  'inherit',
]);

// Filter fullChoices to get only the entries whose keys are in reducedKeys
const reducedChoices = fullChoices.filter(choice => reducedKeys.has(choice[0]));

type TimeComparisonControlsType = {
  multi?: boolean;
  showCalculationType?: boolean;
  showFullChoices?: boolean;
};
export const timeComparisonControls: ({
  multi,
  showCalculationType,
  showFullChoices,
}: TimeComparisonControlsType) => ControlPanelSectionConfig = ({
  multi = true,
  showCalculationType = true,
  showFullChoices = true,
}) => ({
  label: t('Time Comparison'),
  tabOverride: 'data',
  description: t('Compare results with other time periods.'),
  controlSetRows: [
    [
      {
        name: 'time_compare',
        config: {
          type: 'SelectControl',
          multi,
          freeForm: true,
          placeholder: t('Select or type a custom value...'),
          label: t('Time shift'),
          choices: showFullChoices ? fullChoices : reducedChoices,
          description: t(
            'Overlay results from a relative time period. ' +
              'Expects relative time deltas ' +
              'in natural language (example:  24 hours, 7 days, ' +
              '52 weeks, 365 days). Free text is supported. ' +
              'Use "Inherit range from time filters" ' +
              'to shift the comparison time range ' +
              'by the same length as your time range ' +
              'and use "Custom" to set a custom comparison range.',
          ),
        },
      },
    ],
    [
      {
        name: 'start_date_offset',
        config: {
          type: 'TimeOffsetControl',
          label: t('Shift start date'),
          visibility: ({ controls }) =>
            controls?.time_compare.value === 'custom',
          mapStateToProps: (
            state: ControlPanelState,
            controlState: ControlState,
          ) => {
            const { form_data } = state;
            const { time_compare } = form_data;
            const newState = { ...controlState };
            if (
              time_compare === 'custom' &&
              (controlState.value === '' || controlState.value === INVALID_DATE)
            ) {
              newState.externalValidationErrors = [
                t('A date is required when using custom date shift'),
              ];
            } else {
              newState.externalValidationErrors = [];
            }
            return newState;
          },
        },
      },
    ],
    [
      {
        name: 'comparison_type',
        config: {
          type: 'SelectControl',
          label: t('Calculation type'),
          default: 'values',
          choices: [
            [ComparisonType.Values, t('Actual values')],
            [ComparisonType.Difference, t('Difference')],
            [ComparisonType.Percentage, t('Percentage change')],
            [ComparisonType.Ratio, t('Ratio')],
          ],
          description: t(
            'How to display time shifts: as individual lines; as the ' +
              'difference between the main time series and each time shift; ' +
              'as the percentage change; or as the ratio between series and time shifts.',
          ),
          hidden: () => Boolean(showCalculationType),
        },
      },
    ],
    [
      {
        name: 'comparison_range_label',
        config: {
          type: 'ComparisonRangeLabel',
          multi,
          visibility: ({ controls }) => Boolean(controls?.time_compare.value),
        },
      },
    ],
  ],
});
