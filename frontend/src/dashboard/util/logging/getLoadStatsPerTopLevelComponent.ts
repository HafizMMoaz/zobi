import { ChartState } from 'src/explore/types';
import { Layout } from 'src/dashboard/types';
import findTopLevelComponentIds from './findTopLevelComponentIds';
import childChartsDidLoad from './childChartsDidLoad';

interface GetLoadStatsParams {
  layout: Layout;
  chartQueries: Record<string, Partial<ChartState>>;
}

interface LoadStats {
  didLoad: boolean;
  id: string;
  minQueryStartTime: number | null;
  [key: string]: unknown;
}

export default function getLoadStatsPerTopLevelComponent({
  layout,
  chartQueries,
}: GetLoadStatsParams): Record<string, LoadStats> {
  const topLevelComponents = findTopLevelComponentIds(layout);
  const stats: Record<string, LoadStats> = {};
  topLevelComponents.forEach(topLevelComponent => {
    const { id, ...restStats } = topLevelComponent;
    const { didLoad, minQueryStartTime } = childChartsDidLoad({
      id,
      layout,
      chartQueries,
    });

    stats[id] = {
      didLoad,
      id,
      minQueryStartTime,
      ...restStats,
    };
  });

  return stats;
}
