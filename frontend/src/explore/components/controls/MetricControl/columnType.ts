import { Column } from '@zobi-ui/core';

export type ColumnType = Pick<Column, 'column_name' | 'type'>;

// For backward compatibility with PropTypes usage - create a placeholder object
const columnType = {} as any;
export default columnType;
