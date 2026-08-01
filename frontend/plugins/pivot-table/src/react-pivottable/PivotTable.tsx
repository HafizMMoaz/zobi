import { memo } from 'react';
import { TableRenderer } from './TableRenderers';
import type { ComponentProps } from 'react';

type PivotTableProps = ComponentProps<typeof TableRenderer>;

function PivotTable(props: PivotTableProps) {
  return <TableRenderer {...props} />;
}

export default memo(PivotTable);
