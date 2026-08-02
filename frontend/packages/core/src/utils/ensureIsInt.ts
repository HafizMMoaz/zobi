export default function ensureIsInt<T>(
  value: T,
  defaultValue?: number,
): number {
  const val = parseInt(String(value), 10);
  const defaultOrNaN = defaultValue === undefined ? NaN : defaultValue;
  return Number.isNaN(val) ? defaultOrNaN : val;
}
