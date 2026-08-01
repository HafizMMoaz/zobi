import { validateNumber } from '@zobi-ui/core';

export function tokenizeToNumericArray(value?: string): number[] | null {
  if (!value?.trim()) return null;
  const tokens = value.split(',');
  if (tokens.some(token => validateNumber(token)))
    throw new Error('All values should be numeric');
  return tokens.map(token => parseFloat(token));
}

export function tokenizeToStringArray(value?: string): string[] | null {
  if (!value?.trim()) return null;
  const tokens = value.split(',');
  return tokens.map(token => token.trim());
}
