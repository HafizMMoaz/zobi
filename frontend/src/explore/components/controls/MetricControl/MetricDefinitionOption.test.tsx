import { render, screen, userEvent } from 'spec/helpers/testing-library';

import MetricDefinitionOption from 'src/explore/components/controls/MetricControl/MetricDefinitionOption';

type MetricDefinitionOptionProps = {
  option: {
    metric_name?: string;
    expression?: string;
    column_name?: string;
    aggregate_name?: string;
  };
};

const renderMetricDefinitionOption = (props: MetricDefinitionOptionProps) => {
  render(<MetricDefinitionOption {...props} />, {
    useRedux: true,
    useRouter: true,
  });
};

test('renders a given saved metric and display SQL expression popover when hovered', async () => {
  renderMetricDefinitionOption({
    option: { metric_name: 'a_saved_metric', expression: 'COUNT(*)' },
  });
  expect(await screen.findByText('a_saved_metric')).toBeInTheDocument();

  // Grab calculator icon and mock mouse hovering over it
  const calculatorIcon = await screen.findByLabelText('calculator');
  userEvent.hover(calculatorIcon);
  expect(await screen.findByText('SQL expression')).toBeInTheDocument();
});

test('renders when given a column', async () => {
  renderMetricDefinitionOption({ option: { column_name: 'a_column' } });
  expect(await screen.findByText('a_column')).toBeInTheDocument();
});

test('renders when given an aggregate metric', async () => {
  renderMetricDefinitionOption({ option: { aggregate_name: 'an_aggregate' } });
  expect(await screen.findByText('an_aggregate')).toBeInTheDocument();
});
