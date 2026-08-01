
import { validateNumber } from '@zobi.dev/core';

export function parseAxisBound(
  bound?: string | number | null,
): number | undefined {
  if (bound === undefined || bound === null || Number.isNaN(Number(bound))) {
    return undefined;
  }
  return Number(bound);
}

export function parseNumbersList(value: string, delim = ';') {
  if (!value?.trim()) return [];
  return value.split(delim).map(num => {
    if (validateNumber(num)) throw new Error('All values must be numeric');
    return Number(num);
  });
}
