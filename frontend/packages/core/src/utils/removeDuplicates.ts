/**
 * Remove duplicate items from a list.
 */
export function removeDuplicates<T>(
  items: T[],
  hash?: (item: T) => unknown,
): T[] {
  if (hash) {
    const seen = new Set();
    return items.filter(x => {
      const itemHash = hash(x);
      if (seen.has(itemHash)) return false;
      seen.add(itemHash);
      return true;
    });
  }
  return [...new Set(items)];
}

export default removeDuplicates;
