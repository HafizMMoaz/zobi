import {
  ControlConfig,
  ControlSetItem,
  QueryModeLabel,
} from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';
import { QueryMode } from '@zobi-ui/core';
import { getQueryMode } from './shared';

const queryMode: ControlConfig<'RadioButtonControl'> = {
  type: 'RadioButtonControl',
  label: t('Query mode'),
  default: null,
  options: [
    [QueryMode.Aggregate, QueryModeLabel[QueryMode.Aggregate]],
    [QueryMode.Raw, QueryModeLabel[QueryMode.Raw]],
  ],
  mapStateToProps: ({ controls }) => ({ value: getQueryMode(controls) }),
  rerender: ['all_columns', 'groupby', 'metrics', 'percent_metrics'],
};

export const queryModeControlSetItem: ControlSetItem = {
  name: 'query_mode',
  config: queryMode,
};
