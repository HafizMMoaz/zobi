import { ReactElement, useMemo } from 'react';
import Mustache from 'mustache';
import { Typography } from '@zobi.dev/core/components';
import { MetricOption } from '@zobi.dev/chart-controls';
import type { Row, ColumnRow, MetricRow } from '../../types';

interface LeftCellProps {
  row: Row;
  rowType: 'column' | 'metric';
  url?: string;
}

/**
 * Renders the left cell containing either column labels or metric information
 */
const LeftCell = ({ row, rowType, url }: LeftCellProps): ReactElement => {
  const fullUrl = useMemo(() => {
    if (!url) return undefined;
    const context = { metric: row };
    return Mustache.render(url, context);
  }, [url, row]);

  if (rowType === 'column') {
    const column = row as ColumnRow;
    if (fullUrl)
      return (
        <Typography.Link
          href={fullUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {column.label}
        </Typography.Link>
      );

    return <span>{column.label || ''}</span>;
  }

  return (
    <MetricOption
      metric={row as MetricRow}
      url={fullUrl}
      showFormula={false}
      openInNewWindow
    />
  );
};

export default LeftCell;
