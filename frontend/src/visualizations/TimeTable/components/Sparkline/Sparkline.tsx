import { ReactElement } from 'react';
import { SparklineCell } from '..';
import {
  transformSparklineData,
  parseSparklineDimensions,
  validateYAxisBounds,
} from '../../utils';
import type { ColumnConfig, Entry } from '../../types';

interface SparklineProps {
  valueField: string;
  column: ColumnConfig;
  entries: Entry[];
}

/**
 * Renders a sparkline component with processed data
 */
const Sparkline = ({
  valueField,
  column,
  entries,
}: SparklineProps): ReactElement => {
  const sparkData = transformSparklineData(valueField, column, entries);
  const { width, height } = parseSparklineDimensions(column);
  const yAxisBounds = validateYAxisBounds(column.yAxisBounds);

  return (
    <SparklineCell
      ariaLabel={`spark-${valueField}`}
      width={width}
      height={height}
      data={sparkData}
      dataKey={`spark-${valueField}`}
      dateFormat={column.dateFormat || ''}
      numberFormat={column.d3format || ''}
      yAxisBounds={yAxisBounds}
      showYAxis={column.showYAxis || false}
      entries={entries}
      sparkType={column.sparkType || 'line'}
    />
  );
};

export default Sparkline;
