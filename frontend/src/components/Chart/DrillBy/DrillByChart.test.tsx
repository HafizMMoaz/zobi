import { render, screen, waitFor } from 'spec/helpers/testing-library';
import chartQueries, { sliceId } from 'spec/fixtures/mockChartQueries';
import { noOp } from 'src/utils/common';
import DrillByChart from './DrillByChart';

const chart = chartQueries[sliceId];
const dataset = {
  changed_on_humanized: '01-01-2001',
  created_on_humanized: '01-01-2001',
  description: 'desc',
  table_name: 'my_dataset',
  owners: [
    {
      first_name: 'Sarah',
      last_name: 'Connor',
    },
  ],
  columns: [
    {
      column_name: 'gender',
    },
    { column_name: 'name' },
  ],
};

const setup = (overrides: Record<string, any> = {}, result?: any) =>
  render(
    <DrillByChart
      formData={{ ...chart.form_data, ...overrides }}
      onContextMenu={noOp}
      inContextMenu={false}
      result={result}
      dataset={dataset}
    />,
    {
      useRedux: true,
    },
  );

const waitForRender = (overrides: Record<string, any> = {}) =>
  waitFor(() => setup(overrides));

test('should render', async () => {
  const { container } = await waitForRender();
  expect(container).toBeInTheDocument();
});

test('should render the "No results" components', async () => {
  setup({}, []);
  expect(await screen.findByText('No Results')).toBeInTheDocument();
});
