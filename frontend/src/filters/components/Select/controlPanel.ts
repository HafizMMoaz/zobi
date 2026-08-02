import { t } from '@zobi.dev/extension-api/translation';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { ensureIsArray, validateNonEmpty } from '@zobi.dev/core';
import { ControlPanelConfig, sharedControls } from '@zobi.dev/chart-controls';
import { DEFAULT_FORM_DATA, SelectFilterOperatorType } from './types';

const {
  enableEmptyFilter,
  inverseSelection,
  multiSelect,
  creatable,
  defaultToFirstItem,
  searchAllOptions,
  sortAscending,
  operatorType,
} = DEFAULT_FORM_DATA;

type FilterSelectColumn = {
  column_name: string;
  type_generic?: GenericDataType | null;
};

export const getOperatorTypeChoices = (isStringColumn: boolean) => [
  [SelectFilterOperatorType.Exact, t('Exact match (IN)')],
  ...(isStringColumn
    ? [
        [SelectFilterOperatorType.Contains, t('Contains text (ILIKE %x%)')],
        [SelectFilterOperatorType.StartsWith, t('Starts with (ILIKE x%)')],
        [SelectFilterOperatorType.EndsWith, t('Ends with (ILIKE %x)')],
      ]
    : []),
];

export const isStringOperatorColumn = (
  selectedColumn: unknown,
  columns?: FilterSelectColumn[],
) => {
  const columnName = ensureIsArray(selectedColumn)[0];
  if (!columnName || !columns) {
    return true;
  }
  const column = columns.find(col => col.column_name === columnName);
  if (!column || column.type_generic == null) {
    return true;
  }
  return column.type_generic === GenericDataType.String;
};

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'groupby',
            config: {
              ...sharedControls.groupby,
              label: t('Column'),
              required: true,
            },
          },
        ],
      ],
    },
    {
      label: t('UI Configuration'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'operatorType',
            config: {
              type: 'SelectControl',
              renderTrigger: true,
              affectsDataMask: true,
              label: t('Match type'),
              default: operatorType,
              choices: getOperatorTypeChoices(true),
              description: t(
                'Determines how the filter matches values. ' +
                  '"Exact match" uses the IN operator (default). ' +
                  'ILIKE options enable partial text matching with a free-text input. ' +
                  'Warning: ILIKE queries may be slow on large datasets as they cannot use indexes effectively.',
              ),
              mapStateToProps: state => {
                const isStringColumn = isStringOperatorColumn(
                  state.controls?.groupby?.value,
                  state.datasource?.columns as FilterSelectColumn[] | undefined,
                );
                return {
                  choices: getOperatorTypeChoices(isStringColumn),
                  description: isStringColumn
                    ? t(
                        'Determines how the filter matches values. ' +
                          '"Exact match" uses the IN operator (default). ' +
                          'ILIKE options enable partial text matching with a free-text input. ' +
                          'Warning: ILIKE queries may be slow on large datasets as they cannot use indexes effectively.',
                      )
                    : t(
                        'Only exact match is available for non-string columns.',
                      ),
                };
              },
            },
          },
        ],
        [
          {
            name: 'sortAscending',
            config: {
              type: 'CheckboxControl',
              renderTrigger: true,
              label: t('Sort ascending'),
              default: sortAscending,
              description: t('Check for sorting ascending'),
            },
          },
        ],
        [
          {
            name: 'creatable',
            config: {
              type: 'CheckboxControl',
              label: t('Allow creation of new values'),
              default: creatable,
              affectsDataMask: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'multiSelect',
            config: {
              type: 'CheckboxControl',
              label: t('Can select multiple values'),
              default: multiSelect,
              resetConfig: true,
              affectsDataMask: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableEmptyFilter',
            config: {
              type: 'CheckboxControl',
              label: t('Filter value is required'),
              default: enableEmptyFilter,
              renderTrigger: true,
              description: t(
                'User must select a value before applying the filter',
              ),
            },
          },
        ],
        [
          {
            name: 'defaultToFirstItem',
            config: {
              type: 'CheckboxControl',
              label: t('Select first filter value by default'),
              default: defaultToFirstItem,
              resetConfig: true,
              affectsDataMask: true,
              renderTrigger: true,
              requiredFirst: true,
              description: t(
                'When using this option, default value can’t be set. Using this option may impact the load times for your dashboard.',
              ),
            },
          },
        ],
        [
          {
            name: 'inverseSelection',
            config: {
              type: 'CheckboxControl',
              renderTrigger: true,
              affectsDataMask: true,
              label: t('Inverse selection'),
              default: inverseSelection,
              description: t('Exclude selected values'),
            },
          },
        ],
        [
          {
            name: 'searchAllOptions',
            config: {
              type: 'CheckboxControl',
              renderTrigger: true,
              affectsDataMask: true,
              label: t('Dynamically search all filter values'),
              default: searchAllOptions,
              description: t(
                'By default, each filter loads at most 1000 choices at the initial page load. ' +
                  'Check this box if you have more than 1000 filter values and want to enable dynamically ' +
                  'searching that loads filter values as users type (may add stress to your database).',
              ),
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    groupby: {
      multi: false,
      validators: [validateNonEmpty],
    },
  },
};

export default config;
