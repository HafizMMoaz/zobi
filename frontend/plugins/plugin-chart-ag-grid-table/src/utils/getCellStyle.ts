
import {
  ColorFormatters,
  getTextColorForBackground,
  ObjectFormattingEnum,
} from '@zobi-ui/chart-controls';
import { CellClassParams } from '@zobi-ui/core/components/ThemedAgGridReact';
import { BasicColorFormatterType, InputColumn } from '../types';

type CellStyleParams = CellClassParams & {
  hasColumnColorFormatters: boolean | undefined;
  columnColorFormatters: ColorFormatters;
  hasBasicColorFormatters: boolean | undefined;
  basicColorFormatters?: {
    [Key: string]: BasicColorFormatterType;
  }[];
  col: InputColumn;
  cellSurfaceColor: string;
  hoverCellSurfaceColor: string;
};

const getCellStyle = (params: CellStyleParams) => {
  const {
    value,
    colDef,
    rowIndex,
    hasBasicColorFormatters,
    basicColorFormatters,
    hasColumnColorFormatters,
    columnColorFormatters,
    col,
    node,
    cellSurfaceColor,
    hoverCellSurfaceColor,
  } = params;
  let backgroundColor;
  let color;
  if (hasColumnColorFormatters) {
    columnColorFormatters!
      .filter(formatter => {
        const colTitle = formatter?.column?.includes('Main')
          ? formatter?.column?.replace('Main', '').trim()
          : formatter?.column;
        return colTitle === colDef.field;
      })
      .forEach(formatter => {
        const formatterResult =
          value || value === 0 ? formatter.getColorFromValue(value) : false;
        if (formatterResult) {
          if (
            formatter.objectFormatting === ObjectFormattingEnum.TEXT_COLOR ||
            formatter.toTextColor
          ) {
            color = formatterResult;
          } else if (
            formatter.objectFormatting !== ObjectFormattingEnum.CELL_BAR
          ) {
            backgroundColor = formatterResult;
          }
        }
      });
  }

  if (
    hasBasicColorFormatters &&
    col?.metricName &&
    node?.rowPinned !== 'bottom'
  ) {
    backgroundColor =
      basicColorFormatters?.[rowIndex]?.[col.metricName]?.backgroundColor;
  }

  const textAlign =
    col?.config?.horizontalAlign || (col?.isNumeric ? 'right' : 'left');
  const resolvedTextColor = getTextColorForBackground(
    { backgroundColor, color },
    cellSurfaceColor,
  );
  const hoverResolvedTextColor = getTextColorForBackground(
    { backgroundColor, color },
    hoverCellSurfaceColor,
  );

  return {
    backgroundColor: backgroundColor || '',
    color: '',
    '--ag-cell-value-color': resolvedTextColor || '',
    '--ag-cell-value-hover-color': hoverResolvedTextColor || '',
    textAlign,
  };
};

export default getCellStyle;
