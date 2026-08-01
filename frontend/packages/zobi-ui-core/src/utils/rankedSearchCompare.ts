
/**
 * Sort comparator with basic rankings.
 */
export function rankedSearchCompare(a: string, b: string, search: string) {
  const aLower = a.toLowerCase() || '';
  const bLower = b.toLowerCase() || '';
  const searchLower = search.toLowerCase() || '';
  if (!search) return a.localeCompare(b);
  return (
    Number(b === search) - Number(a === search) ||
    Number(b.startsWith(search)) - Number(a.startsWith(search)) ||
    Number(bLower === searchLower) - Number(aLower === searchLower) ||
    Number(bLower.startsWith(searchLower)) -
      Number(aLower.startsWith(searchLower)) ||
    Number(b.includes(search)) - Number(a.includes(search)) ||
    Number(bLower.includes(searchLower)) - Number(a.includes(searchLower)) ||
    a.localeCompare(b)
  );
}
