
// helper functions for select controls

export type Formattable = string | number;

export type Formatted = [Formattable, string];

/** Turns an array of string/number options into options for a select input */
export function formatSelectOptions<T extends Formattable>(
  options: (T | [T, string])[],
): [T, string][] {
  return options.map(opt => (Array.isArray(opt) ? opt : [opt, opt.toString()]));
}

/**
 * Outputs array of arrays
 *   >> formatSelectOptionsForRange(1, 5)
 *   >> [[1,'1'], [2,'2'], [3,'3'], [4,'4'], [5,'5']]
 */
export function formatSelectOptionsForRange(
  start: number,
  end: number,
  step = 1,
): Formatted[] {
  const options: Formatted[] = [];
  for (let i = start; i <= end; i += step) {
    options.push([i, i.toString()]);
  }
  return options;
}
