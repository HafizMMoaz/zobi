import { QueryResponse } from '@zobi.dev/core';
import {
  ColumnMeta,
  ControlPanelState,
  Dataset,
} from '@zobi.dev/chart-controls';

export function columnChoices(datasource: Dataset | QueryResponse | null) {
  if (datasource?.columns) {
    return datasource.columns
      .map(col => [
        col.column_name,
        (col as ColumnMeta).verbose_name || col.column_name,
      ])
      .sort((opt1, opt2) =>
        opt1[1].toLowerCase() > opt2[1].toLowerCase() ? 1 : -1,
      );
  }
  return [];
}

export const PRIMARY_COLOR = { r: 0, g: 122, b: 135, a: 1 };
export const BLACK_COLOR = { r: 0, g: 0, b: 0, a: 1 };

export default {
  default: null,
  mapStateToProps: (state: ControlPanelState) => ({
    choices: state.datasource
      ? (state.datasource as Dataset).time_grain_sqla?.filter(
          o => o[0] !== null,
        )
      : null,
  }),
};
