import { render, screen, userEvent } from 'spec/helpers/testing-library';
import FixedOrMetricControl from '.';

jest.mock(
  '@zobi-ui/core/components/Icons/AsyncIcon',
  () =>
    ({ fileName }: { fileName: string }) => (
      <span role="img" aria-label={fileName.replace('_', '-')} />
    ),
);

const createProps = () => ({
  datasource: {
    columns: [{ column_name: 'Column A' }],
    metrics: [{ metric_name: 'Metric A', expression: 'COUNT(*)' }],
  },
});

test('renders with minimal props', () => {
  render(<FixedOrMetricControl {...createProps()} />);
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
});

test('renders with default value', () => {
  render(
    <FixedOrMetricControl
      {...createProps()}
      default={{ type: 'fix', value: 10 }}
    />,
  );
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByText('10')).toBeInTheDocument();
});

test('renders with value', () => {
  render(
    <FixedOrMetricControl
      {...createProps()}
      default={{ type: 'fix', value: 10 }}
      value={{ type: 'fix', value: 20 }}
    />,
  );
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByText('20')).toBeInTheDocument();
});

test('renders with metric type', () => {
  render(
    <FixedOrMetricControl
      {...createProps()}
      value={{
        type: 'metric',
        value: {
          label: 'Metric A',
          expressionType: 'SQL',
          sqlExpression: 'COUNT(*)',
        },
      }}
    />,
  );
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByText('Metric A')).toBeInTheDocument();
});

test('triggers onChange', () => {
  const onChange = jest.fn();
  render(
    <FixedOrMetricControl
      {...createProps()}
      value={{ type: 'fix', value: 10 }}
      onChange={onChange}
    />,
  );
  userEvent.click(screen.getByText('10'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByRole('textbox'), '20');
  expect(onChange).toHaveBeenCalled();
});

test('switches control type', () => {
  render(
    <FixedOrMetricControl
      {...createProps()}
      value={{ type: 'fix', value: 10 }}
    />,
  );
  userEvent.click(screen.getByText('10'));
  userEvent.click(screen.getByText('Based on a metric'));
  expect(screen.getByText('metric:')).toBeInTheDocument();
  userEvent.click(screen.getByText('Fixed'));
  expect(screen.getByText('10')).toBeInTheDocument();
});
