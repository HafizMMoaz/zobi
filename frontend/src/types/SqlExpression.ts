/**
 * SQL Expression Types - aligned with backend SqlExpressionType enum
 */
export enum SqlExpressionType {
  COLUMN = 'column',
  METRIC = 'metric',
  WHERE = 'where',
  HAVING = 'having',
}

export type ExpressionType = `${SqlExpressionType}`;

/**
 * Validation error structure returned from backend
 */
export interface ValidationError {
  line_number?: number;
  start_column?: number;
  end_column?: number;
  message: string;
}

/**
 * Backend validation response structure
 */
export interface ValidationResponse {
  result: ValidationError[];
}
