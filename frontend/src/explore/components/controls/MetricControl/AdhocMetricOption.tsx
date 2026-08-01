import { PureComponent } from 'react';
import { Metric } from '@zobi-ui/core';
import { OptionControlLabel } from 'src/explore/components/controls/OptionControls';
import { DndItemType } from 'src/explore/components/DndItemType';
import { Datasource } from 'src/explore/types';
import { ISaveableDatasource } from 'src/SqlLab/components/SaveDatasetModal';
import AdhocMetric from './AdhocMetric';
import AdhocMetricPopoverTrigger from './AdhocMetricPopoverTrigger';
import { savedMetricType as SavedMetricTypeDef } from './types';

interface AdhocMetricOptionProps {
  adhocMetric: AdhocMetric;
  onMetricEdit: (newMetric: Metric, oldMetric: Metric) => void;
  onRemoveMetric?: (index: number) => void;
  columns?: { column_name: string; type: string }[];
  savedMetricsOptions?: SavedMetricTypeDef[];
  savedMetric?: SavedMetricTypeDef | Record<string, never>;
  datasource?: Datasource & ISaveableDatasource;
  onMoveLabel?: (dragIndex: number, hoverIndex: number) => void;
  onDropLabel?: () => void;
  index?: number;
  type?: string;
  multi?: boolean;
  datasourceWarningMessage?: string;
}

class AdhocMetricOption extends PureComponent<AdhocMetricOptionProps> {
  constructor(props: AdhocMetricOptionProps) {
    super(props);
    this.onRemoveMetric = this.onRemoveMetric.bind(this);
  }

  onRemoveMetric(e?: React.MouseEvent): void {
    e?.stopPropagation();
    this.props.onRemoveMetric?.(this.props.index ?? 0);
  }

  render() {
    const {
      adhocMetric,
      onMetricEdit,
      columns,
      savedMetricsOptions,
      savedMetric = {} as SavedMetricTypeDef,
      datasource,
      onMoveLabel,
      onDropLabel,
      index,
      type,
      multi,
      datasourceWarningMessage,
    } = this.props;
    const withCaret = !(savedMetric as SavedMetricTypeDef).error_text;

    return (
      <AdhocMetricPopoverTrigger
        adhocMetric={adhocMetric}
        onMetricEdit={onMetricEdit}
        columns={columns ?? []}
        savedMetricsOptions={savedMetricsOptions ?? []}
        savedMetric={savedMetric}
        datasource={datasource!}
      >
        <OptionControlLabel
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          savedMetric={savedMetric as any}
          adhocMetric={adhocMetric}
          label={adhocMetric.label}
          onRemove={() => this.onRemoveMetric()}
          onMoveLabel={onMoveLabel}
          onDropLabel={onDropLabel}
          index={index ?? 0}
          type={type ?? DndItemType.AdhocMetricOption}
          withCaret={withCaret}
          isFunction
          multi={multi}
          datasourceWarningMessage={datasourceWarningMessage}
        />
      </AdhocMetricPopoverTrigger>
    );
  }
}

export default AdhocMetricOption;
