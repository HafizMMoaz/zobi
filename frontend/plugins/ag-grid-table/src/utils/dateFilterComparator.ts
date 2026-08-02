/**
 * Timezone-safe date comparator for AG Grid date filters.
 *
 * This comparator normalizes both dates to UTC midnight before comparison,
 * fixing the off-by-one day bug that occurs when:
 * - User's timezone differs from UTC
 * - Data is stored in UTC but filtered in local time
 * - Midnight boundary crossing due to timezone offset
 *
 * Bug references:
 * - AG Grid Issue #8611: UTC Date Editor Problem
 * - AG Grid Issue #3921: DateFilter timezone regression
 *
 */
const dateFilterComparator = (
  filterDate: Date,
  cellValue: Date | null | undefined,
) => {
  if (cellValue == null) {
    return -1;
  }

  const cellDate = new Date(cellValue);
  if (Number.isNaN(cellDate.getTime())) {
    return -1;
  }

  // Filter date from AG Grid uses local timezone (what the user selected)
  const filterUTC = Date.UTC(
    filterDate.getFullYear(),
    filterDate.getMonth(),
    filterDate.getDate(),
  );

  // Cell data is in UTC - extract UTC components to compare actual dates
  const cellUTC = Date.UTC(
    cellDate.getUTCFullYear(),
    cellDate.getUTCMonth(),
    cellDate.getUTCDate(),
  );

  if (cellUTC < filterUTC) {
    return -1;
  }
  if (cellUTC > filterUTC) {
    return 1;
  }

  return 0;
};

export default dateFilterComparator;
