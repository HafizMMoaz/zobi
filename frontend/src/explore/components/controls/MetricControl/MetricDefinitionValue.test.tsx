import { render, screen } from 'spec/helpers/testing-library';
import MetricDefinitionValue from 'src/explore/components/controls/MetricControl/MetricDefinitionValue';
import AdhocMetric from 'src/explore/components/controls/MetricControl/AdhocMetric';
import { AGGREGATES } from 'src/explore/constants';

const sumValueAdhocMetric = new AdhocMetric({
  column: { type: 'DOUBLE', column_name: 'value' },
  aggregate: AGGREGATES.SUM,
});

const defaultProps = {
  onMetricEdit: jest.fn(),
  option: sumValueAdhocMetric as AdhocMetric,
  index: 1,
  columns: [],
  savedMetrics: [],
  savedMetricsOptions: [],
  datasource: undefined,
  onMoveLabel: jest.fn(),
  onDropLabel: jest.fn(),
};

const setup = (propOverrides: Record<string, unknown> = {}) => {
  const props = {
    ...defaultProps,
    ...propOverrides,
  };
  return render(<MetricDefinitionValue {...props} />, { useDnd: true });
};

test('renders a MetricOption given a saved metric', () => {
  setup({
    option: { metric_name: 'a_saved_metric', expression: 'COUNT(*)' },
  });
  expect(screen.getByText('a_saved_metric')).toBeInTheDocument();
});

test('renders an AdhocMetricOption given an adhoc metric', () => {
  setup({});
  expect(screen.getByText('SUM(value)')).toBeInTheDocument();
});
