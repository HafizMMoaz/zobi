
import { Page, APIResponse } from '@playwright/test';
import { apiPost, ApiRequestOptions } from './requests';

const ENDPOINTS = {
  SQLLAB_EXECUTE: 'api/v1/sqllab/execute/',
} as const;

/**
 * Execute a SQL query via SQL Lab API.
 * Requires `allow_dml=True` on the target database for DDL/DML statements.
 * @param page - Playwright page instance (provides authentication context)
 * @param databaseId - ID of the database to execute against
 * @param sql - SQL statement to execute
 * @param schema - Optional schema context for the query
 * @returns API response from SQL Lab execution
 */
export async function apiExecuteSql(
  page: Page,
  databaseId: number,
  sql: string,
  schema?: string,
  options?: ApiRequestOptions,
): Promise<APIResponse> {
  return apiPost(
    page,
    ENDPOINTS.SQLLAB_EXECUTE,
    {
      database_id: databaseId,
      sql,
      schema: schema ?? null,
    },
    options,
  );
}
