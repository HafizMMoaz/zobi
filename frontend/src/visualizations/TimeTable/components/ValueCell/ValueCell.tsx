import { ReactElement, useMemo } from 'react';
import { colorFromBounds, calculateCellValue } from '../../utils';
import FormattedNumber from '../FormattedNumber';
import type { ColumnConfig, Entry } from '../../types';

interface ValueCellProps {
  valueField: string;
  column: ColumnConfig;
  reversedEntries: Entry[];
}

/**
 * Renders a value cell with different calculation types (time, contrib, avg)
 * and applies color coding based on bounds
 */
const ValueCell = ({
  valueField,
  column,
  reversedEntries,
}: ValueCellProps): ReactElement => {
  const { value: v, errorMsg } = useMemo(
    () => calculateCellValue(valueField, column, reversedEntries),
    [valueField, column, reversedEntries],
  );

  const color = colorFromBounds(v, column.bounds);

  return (
    <span
      key={column.key}
      data-value={v}
      css={theme =>
        color && {
          boxShadow: `inset 0px -2.5px 0px 0px ${color}`,
          borderRight: `2px solid ${theme.colorBorderSecondary}`,
        }
      }
    >
      {errorMsg || (
        <span style={{ color: color || undefined }}>
          <FormattedNumber num={v} format={column.d3format} />
        </span>
      )}
    </span>
  );
};

export default ValueCell;
