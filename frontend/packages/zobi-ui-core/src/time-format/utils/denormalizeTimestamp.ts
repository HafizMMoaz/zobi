

import { TS_REGEX } from './normalizeTimestamp';

export default function normalizeTimestamp(value: string): string {
  const match = value.match(TS_REGEX);
  if (match) {
    return `${match[1]}T${match[2]}`;
  }
  return value;
}
