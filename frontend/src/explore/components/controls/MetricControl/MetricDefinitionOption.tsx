import {
  StyledColumnOption,
  StyledMetricOption,
} from 'src/explore/components/optionRenderers';
import withToasts from 'src/components/MessageToasts/withToasts';
import AggregateOption from './AggregateOption';

interface MetricDefinitionOptionProps {
  option: {
    metric_name?: string;
    column_name?: string;
    aggregate_name?: string;
    [key: string]: unknown;
  };
  addWarningToast: (message: string) => void;
}

function MetricDefinitionOption({
  option,
  addWarningToast,
}: MetricDefinitionOptionProps) {
  if (option.metric_name) {
    return <StyledMetricOption metric={option as any} showType />;
  }
  if (option.column_name) {
    return <StyledColumnOption column={option as any} showType />;
  }
  if (option.aggregate_name) {
    return (
      <AggregateOption
        aggregate={{ aggregate_name: option.aggregate_name }}
        showType
      />
    );
  }
  addWarningToast(
    'You must supply either a saved metric, column or aggregate to MetricDefinitionOption',
  );
  return null;
}

export default withToasts(MetricDefinitionOption);
