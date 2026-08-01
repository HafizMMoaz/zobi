import { isEmpty, isNaN, isNil, isString, trim } from 'lodash';

/**
 * Checks if a value is null, undefined, NaN, or a whitespace-only string.
 */
export default function isBlank(value: unknown): boolean {
  return (
    isNil(value) || isNaN(value) || (isString(value) && isEmpty(trim(value)))
  );
}
