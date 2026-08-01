import { ChartState } from 'src/explore/types';
import { Layout } from 'src/dashboard/types';
import findNonTabChildCharIds from './findNonTabChildChartIds';

interface ChildChartsDidLoadParams {
  chartQueries: Record<string, Partial<ChartState>>;
  layout: Layout;
  id: string;
}

interface ChildChartsDidLoadResult {
  didLoad: boolean;
  minQueryStartTime: number;
}

export default function childChartsDidLoad({
  chartQueries,
  layout,
  id,
}: ChildChartsDidLoadParams): ChildChartsDidLoadResult {
  const chartIds = findNonTabChildCharIds({ id, layout });

  let minQueryStartTime = Infinity;
  const didLoad = chartIds.every((chartId: number) => {
    const query = chartQueries[chartId.toString()] || {};
    minQueryStartTime = Math.min(
      query.chartUpdateStartTime ?? Infinity,
      minQueryStartTime,
    );
    return ['stopped', 'failed', 'rendered'].includes(query.chartStatus || '');
  });

  return { didLoad, minQueryStartTime };
}
