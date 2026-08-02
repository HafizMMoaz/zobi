/**
 * Safely parses a value to a numeric type
 * @param value - The value to parse (string, number, or null)
 * @returns The numeric value or 0 if invalid
 */
export function parseToNumber(value?: string | number | null): number {
  const displayValue = value ?? 0;
  const numericValue =
    typeof displayValue === 'string' ? parseFloat(displayValue) : displayValue;

  return Number.isNaN(numericValue) ? 0 : numericValue;
}
