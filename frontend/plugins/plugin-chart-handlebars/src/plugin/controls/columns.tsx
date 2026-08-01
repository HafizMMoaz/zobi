import {
  ControlSetItem,
  ExtraControlProps,
  sharedControls,
  Dataset,
  ColumnMeta,
} from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';
import { ensureIsArray } from '@zobi-ui/core';
import { getQueryMode, isRawMode } from './shared';

const dndAllColumns: typeof sharedControls.groupby = {
  type: 'DndColumnSelect',
  label: t('Columns'),
  description: t('Columns to display'),
  default: [],
  mapStateToProps({ datasource, controls }, controlState) {
    const newState: ExtraControlProps = {};
    if (datasource) {
      if (datasource?.columns[0]?.hasOwnProperty('filterable')) {
        newState.options = (datasource as Dataset)?.columns?.filter(
          (c: ColumnMeta) => c.filterable,
        );
      } else newState.options = datasource.columns;
    }
    newState.queryMode = getQueryMode(controls);
    newState.externalValidationErrors =
      isRawMode({ controls }) && ensureIsArray(controlState?.value).length === 0
        ? [t('must have a value')]
        : [];
    return newState;
  },
  visibility: isRawMode,
  resetOnHide: false,
};

export const allColumnsControlSetItem: ControlSetItem = {
  name: 'all_columns',
  config: dndAllColumns,
};
