
import type { ValidatorFunction } from '../validator';

/**
 * Wraps a validator function to prepend a label to its error message.
 *
 * @param validator - The validator function to wrap
 * @param label - The label to prepend to error messages
 * @returns A new validator function that includes the label in error messages
 *
 * @example
 * validators: [
 *   withLabel(validateInteger, t('Row limit')),
 * ]
 * // Returns: "Row limit is expected to be an integer"
 */
export default function withLabel<V = unknown, S = unknown>(
  validator: ValidatorFunction<V, S>,
  label: string,
): ValidatorFunction<V, S> {
  return (value: V, state?: S): string | false => {
    const error = validator(value, state);
    return error ? `${label} ${error}` : false;
  };
}
