
export type RowDataValue =
  | string
  | number
  | boolean
  | Date
  | bigint
  | null
  | undefined;

export type RowData = Record<string, RowDataValue>;
