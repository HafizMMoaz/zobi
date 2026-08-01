import { useMemo } from 'react';

export interface JsonValidationAnnotation {
  type: 'error' | 'warning' | 'info';
  row: number;
  column: number;
  text: string;
}

export interface UseJsonValidationOptions {
  /** Whether to enable JSON validation. Default: true */
  enabled?: boolean;
  /** Custom error message prefix. Default: 'Invalid JSON' */
  errorPrefix?: string;
}

/**
 * Hook for JSON validation that returns AceEditor-compatible annotations.
 * Based on the SQL Lab validation pattern.
 *
 * @param jsonValue - The JSON string to validate
 * @param options - Validation options
 * @returns Array of annotation objects for AceEditor
 */
export function useJsonValidation(
  jsonValue?: string,
  options: UseJsonValidationOptions = {},
): JsonValidationAnnotation[] {
  const { enabled = true, errorPrefix = 'Invalid JSON' } = options;

  return useMemo(() => {
    // Skip validation if disabled or empty value
    if (!enabled || !jsonValue?.trim()) {
      return [];
    }

    try {
      JSON.parse(jsonValue);
      return []; // Valid JSON - no annotations
    } catch (error: any) {
      const errorMessage = error.message || 'syntax error';

      // Try to extract line/column from error message
      // Look for pattern: (line X column Y) - often at the end of error messages
      let row = 0;
      let column = 0;

      const match = errorMessage.match(/\(line (\d+) column (\d+)\)/);
      if (match) {
        row = parseInt(match[1], 10) - 1; // Convert to 0-based
        column = parseInt(match[2], 10) - 1;
      }

      return [
        {
          type: 'error' as const,
          row,
          column,
          text: `${errorPrefix}: ${errorMessage}`,
        },
      ];
    }
  }, [enabled, jsonValue, errorPrefix]);
}
