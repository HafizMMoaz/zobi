import { getTimeFormatter, TimeFormats } from '@zobi-ui/core';
import NullCell from '../NullCell';

export interface TimeCellProps {
  format?: string;
  value?: number | Date;
}

function TimeCell({
  format = TimeFormats.DATABASE_DATETIME,
  value,
}: TimeCellProps) {
  if (value) {
    return <span>{getTimeFormatter(format).format(value)}</span>;
  }
  return <NullCell />;
}

export default TimeCell;
