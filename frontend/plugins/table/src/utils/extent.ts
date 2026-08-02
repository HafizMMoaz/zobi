import { isNil } from 'lodash';

export default function extent<T = number | string | Date | undefined | null>(
  values: T[],
) {
  let min: T | undefined;
  let max: T | undefined;
  // eslint-disable-next-line no-restricted-syntax
  for (const value of values) {
    if (value !== null) {
      if (isNil(min)) {
        if (value !== undefined) {
          min = value;
          max = value;
        }
      } else if (value !== undefined) {
        if (min > value) {
          min = value;
        }
        if (!isNil(max)) {
          if (max < value) {
            max = value;
          }
        }
      }
    }
  }
  return [min, max];
}
