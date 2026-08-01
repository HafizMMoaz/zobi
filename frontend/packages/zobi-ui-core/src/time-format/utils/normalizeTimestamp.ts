

export const TS_REGEX = /(\d{4}-\d{2}-\d{2})[\sT](\d{2}:\d{2}:\d{2}\.?\d*).*/;

export default function normalizeTimestamp(value: string): string {
  const match = value.match(TS_REGEX);
  if (match) {
    return `${match[1]}T${match[2]}Z`;
  }
  return value;
}
