import { ChartProps, DataRecord, Metric } from '@zobi-ui/core';

interface FormData {
  groupby: string[];
  metrics: Array<object>;
  url: string;
  columnCollection: Array<object> | [];
}

interface QueryData {
  data: {
    records: DataRecord[];
    columns: string[] | Array<{ column_name: string; id: number }>;
  };
}

export type TableChartProps = ChartProps & {
  formData: FormData;
  queriesData: QueryData[];
};

interface ColumnData {
  timeLag?: string | number;
}

export function transformProps(chartProps: TableChartProps) {
  const { height, datasource, formData, queriesData } = chartProps;
  const { columnCollection = [], groupby, metrics, url } = formData;
  const { records, columns } = queriesData[0].data;
  const isGroupBy = groupby?.length > 0;

  let rows;

  if (isGroupBy) {
    rows = columns.map(column =>
      typeof column === 'object' ? column : { label: column },
    );
  } else {
    const metricMap = datasource.metrics.reduce<Record<string, Metric>>(
      (acc, current) => {
        const map = acc;
        map[current.metric_name] = current;
        return map;
      },
      {},
    );

    rows = metrics.map(metric =>
      typeof metric === 'object' ? metric : metricMap[metric],
    );
  }

  columnCollection.forEach(column => {
    const c: ColumnData = column;

    if (typeof c.timeLag === 'string' && c.timeLag)
      c.timeLag = parseInt(c.timeLag, 10);
  });

  return {
    height,
    data: records,
    columnConfigs: columnCollection,
    rows,
    rowType: isGroupBy ? 'column' : 'metric',
    url,
  };
}
