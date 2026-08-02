interface GetDashboardFilterKeyProps {
  chartId: string;
  column: string;
}

export function getDashboardFilterKey({
  chartId,
  column,
}: GetDashboardFilterKeyProps) {
  return `${chartId}_${column}`;
}

const filterKeySplitter = /^([0-9]+)_(.*)$/;

export function getChartIdAndColumnFromFilterKey(key: string) {
  const match = filterKeySplitter.exec(key);
  if (!match) throw new Error('Cannot parse invalid filter key');
  return { chartId: parseInt(match[1], 10), column: match[2] };
}
