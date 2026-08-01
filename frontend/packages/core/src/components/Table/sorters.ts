
/**
 * @param key The name of the row's attribute used to compare values for alphabetical sorting
 * @param a First row object to compare
 * @param b Second row object to compare
 * @returns number
 */
export const alphabeticalSort = (
  key: string,
  a: Record<PropertyKey, string>,
  b: Record<PropertyKey, string>,
): number => a?.[key]?.localeCompare?.(b?.[key]);

/**
 * @param key The name of the row's attribute used to compare values for numerical sorting
 * @param a First row object to compare
 * @param b Second row object to compare
 * @returns number
 */
export const numericalSort = (
  key: string,
  a: Record<PropertyKey, number>,
  b: Record<PropertyKey, number>,
): number => a?.[key] - b?.[key];
