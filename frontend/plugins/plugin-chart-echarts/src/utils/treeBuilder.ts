import { DataRecord, DataRecordValue } from '@zobi-ui/core';
import { groupBy as _groupBy, transform } from 'lodash';

export type TreeNode = {
  name: DataRecordValue;
  value: number;
  secondaryValue: number;
  groupBy: string;
  children?: TreeNode[];
};

function getMetricValue(datum: DataRecord, metric: string) {
  return typeof datum[metric] === 'number' ? (datum[metric] as number) : 0;
}

export function treeBuilder(
  data: DataRecord[],
  groupBy: string[],
  metric: string,
  secondaryMetric?: string,
): TreeNode[] {
  const [curGroupBy, ...restGroupby] = groupBy;
  const curData = _groupBy(data, curGroupBy);
  return transform(
    curData,
    (result, value, key) => {
      const name = curData[key][0][curGroupBy]!;
      if (!restGroupby.length) {
        (value ?? []).forEach(datum => {
          const metricValue = getMetricValue(datum, metric);
          const secondaryValue = secondaryMetric
            ? getMetricValue(datum, secondaryMetric)
            : metricValue;
          const item = {
            name,
            value: metricValue,
            secondaryValue,
            groupBy: curGroupBy,
          };
          result.push(item);
        });
      } else {
        const children = treeBuilder(
          value,
          restGroupby,
          metric,
          secondaryMetric,
        );
        const metricValue = children.reduce(
          (prev, cur) => prev + (cur.value as number),
          0,
        );
        const secondaryValue = secondaryMetric
          ? children.reduce(
              (prev, cur) => prev + (cur.secondaryValue as number),
              0,
            )
          : metricValue;
        result.push({
          name,
          children,
          value: metricValue,
          secondaryValue,
          groupBy: curGroupBy,
        });
      }
    },
    [] as TreeNode[],
  );
}
