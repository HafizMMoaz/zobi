import { ColumnTypeLabel } from '@zobi.dev/chart-controls';
import { AggregateOption as AggregateOptionType } from './types';

interface AggregateOptionProps {
  aggregate: AggregateOptionType;
  showType?: boolean;
}

export default function AggregateOption({
  aggregate,
  showType,
}: AggregateOptionProps) {
  return (
    <div>
      {showType && <ColumnTypeLabel type={'aggregate' as any} />}
      <span className="option-label">{aggregate.aggregate_name}</span>
    </div>
  );
}
