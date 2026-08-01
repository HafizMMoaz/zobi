import { JsonPrimitive } from '@zobi.dev/core';

export type NaNTreatment = 'alwaysLast' | 'asSmallest' | 'asLargest';

/**
 * Array.sort(...) comparator for potential numeric values with the ability to
 * treat null and NaN as the smallest or largest values or always sort to bottom.
 */
export default function sortNumericValues(
  valueA: JsonPrimitive,
  valueB: JsonPrimitive,
  {
    descending = false,
    nanTreatment = 'alwaysLast',
  }: { descending?: boolean; nanTreatment?: NaNTreatment } = {},
) {
  let orderByIsNaN =
    Number(valueA == null) - Number(valueB == null) ||
    Number(Number.isNaN(Number(valueA))) - Number(Number.isNaN(Number(valueB)));

  // if A is null or NaN and B is not, `orderByIsNaN` is 1,
  // which will make A come after B in the sorted array,
  // since we want to treat A as smallest number, we need to flip the sign
  // when sorting in ascending order.
  if (nanTreatment === 'asSmallest' && !descending) {
    orderByIsNaN = -orderByIsNaN;
  }
  if (nanTreatment === 'asLargest' && descending) {
    orderByIsNaN = -orderByIsNaN;
  }
  return (
    orderByIsNaN || (Number(valueA) - Number(valueB)) * (descending ? -1 : 1)
  );
}
