

export default function stringifyTimeInput(
  value: Date | number | string | undefined | null,
  fn: (time: Date) => string,
) {
  if (value === null || value === undefined) {
    return `${value}`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isIntegerString = /^-?\d+$/.test(trimmed);
    return fn(new Date(isIntegerString ? Number(trimmed) : value));
  }

  return fn(value instanceof Date ? value : new Date(value));
}
