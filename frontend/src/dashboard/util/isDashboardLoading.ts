export interface ChartLoadTimestamps {
  chartUpdateStartTime?: number;
  chartUpdateEndTime?: number | null;
  // allow extra fields without narrowing
  [key: string]: unknown;
}

export default function isDashboardLoading(
  charts: Record<string, ChartLoadTimestamps>,
): boolean {
  return Object.values(charts).some(chart => {
    const start = chart.chartUpdateStartTime ?? 0;
    const end = chart.chartUpdateEndTime ?? 0;
    return start > end;
  });
}
