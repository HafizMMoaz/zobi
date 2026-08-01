import type { TimeTableData, Entry } from '../../types';

/**
 * Converts raw time table data into sorted entries
 */
export function processTimeTableData(data: TimeTableData): {
  entries: Entry[];
  reversedEntries: Entry[];
} {
  const entries: Entry[] = Object.keys(data)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(time => ({ ...data[time], time }));

  const reversedEntries = [...entries].reverse();

  return { entries, reversedEntries };
}
