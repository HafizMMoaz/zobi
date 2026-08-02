/**
 * Type definition for a validator function.
 * Returns an error message string if validation fails, or false if validation passes.
 */
export type ValidatorFunction<V = unknown, S = unknown> = (
  value: V,
  state?: S,
) => string | false;
