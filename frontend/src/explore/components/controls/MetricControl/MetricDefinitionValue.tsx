import { Metric } from '@zobi.dev/core';
import { Datasource } from 'src/explore/types';
import { ISaveableDatasource } from 'src/SqlLab/components/SaveDatasetModal';
import AdhocMetricOption from './AdhocMetricOption';
import AdhocMetric from './AdhocMetric';
import { savedMetricType as SavedMetricTypeDef } from './types';

interface MetricDefinitionValueProps {
  option: AdhocMetric | SavedMetricTypeDef | string;
  index: number;
  onMetricEdit?: (newMetric: Metric, oldMetric: Metric) => void;
  onRemoveMetric?: (index: number) => void;
  onMoveLabel?: (dragIndex: number, hoverIndex: number) => void;
  onDropLabel?: () => void;
  columns?: { column_name: string; type: string }[];
  savedMetrics?: SavedMetricTypeDef[];
  savedMetricsOptions?: SavedMetricTypeDef[];
  multi?: boolean;
  datasource?: Datasource & ISaveableDatasource;
  datasourceWarningMessage?: string;
  type?: string;
}

export default function MetricDefinitionValue({
  option,
  onMetricEdit,
  onRemoveMetric,
  columns,
  savedMetrics,
  savedMetricsOptions,
  datasource,
  onMoveLabel,
  onDropLabel,
  index,
  type,
  multi,
  datasourceWarningMessage,
}: MetricDefinitionValueProps) {
  const getSavedMetricByName = (metricName: string) =>
    savedMetrics?.find(metric => metric.metric_name === metricName);

  let savedMetric;
  if (typeof option === 'string') {
    savedMetric = getSavedMetricByName(option);
  } else if ((option as SavedMetricTypeDef).metric_name) {
    savedMetric = option;
  }

  if (option instanceof AdhocMetric || savedMetric) {
    const adhocMetric =
      option instanceof AdhocMetric ? option : new AdhocMetric({});

    const metricOptionProps = {
      onMetricEdit,
      onRemoveMetric,
      columns,
      savedMetricsOptions,
      datasource,
      adhocMetric,
      onMoveLabel,
      onDropLabel,
      index,
      savedMetric: savedMetric ?? {},
      type,
      multi,
      datasourceWarningMessage,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <AdhocMetricOption {...(metricOptionProps as any)} />;
  }
  return null;
}
