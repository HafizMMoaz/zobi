/**
 * Ensure a nullable value input is an array. Useful when consolidating
 * input format from a select control.
 */
export default function ensureIsArray<T>(value?: T[] | T | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
