
import { CellClassParams } from '@zobi-ui/core/components/ThemedAgGridReact';
import { InputColumn } from '../types';

type GetCellClassParams = CellClassParams & {
  col: InputColumn;
  emitCrossFilters: boolean | undefined;
};

const getCellClass = (params: GetCellClassParams) => {
  const { col, emitCrossFilters } = params;
  let className = '';
  if (emitCrossFilters) {
    if (!col?.isMetric) {
      className += ' dt-is-filter';
    }
    if (col?.config?.truncateLongCells) {
      className += ' dt-truncate-cell';
    }
  }
  return className;
};

export default getCellClass;
