import {
  fireEvent,
  render,
  screen,
  userEvent,
} from 'spec/helpers/testing-library';
import { AGGREGATES } from 'src/explore/constants';
import AdhocMetricOption from 'src/explore/components/controls/MetricControl/AdhocMetricOption';
import AdhocMetric from 'src/explore/components/controls/MetricControl/AdhocMetric';

const columns = [
  { type: 'VARCHAR(255)', column_name: 'source' },
  { type: 'VARCHAR(255)', column_name: 'target' },
  { type: 'DOUBLE', column_name: 'value' },
];

const sumValueAdhocMetric = new AdhocMetric({
  column: columns[2],
  aggregate: AGGREGATES.SUM,
});

const defaultProps = {
  adhocMetric: sumValueAdhocMetric,
  savedMetric: {},
  savedMetricsOptions: [],
  onMetricEdit: jest.fn(),
  columns,
  datasource: {
    type: 'table',
    id: 1,
    uid: '1__table',
    columnFormats: {},
    verboseMap: {},
  },
  onMoveLabel: jest.fn(),
  onDropLabel: jest.fn(),
  index: 0,
};

function setup(overrides: Record<string, unknown> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(<AdhocMetricOption {...(props as any)} />, {
    useDnd: true,
    useRedux: true,
    initialState: { explore: {} },
  });
}

test('renders an overlay trigger wrapper for the label', () => {
  setup({});
  expect(screen.getByText('SUM(value)')).toBeInTheDocument();
});

test('overwrites the adhocMetric in state with onLabelChange', async () => {
  setup({});
  userEvent.click(screen.getByText('SUM(value)'));
  userEvent.click(screen.getByTestId(/AdhocMetricEditTitle#trigger/i));
  const labelInput = await screen.findByTestId(/AdhocMetricEditTitle#input/i);
  userEvent.clear(labelInput);
  userEvent.type(labelInput, 'new label');
  expect(labelInput).toHaveValue('new label');
  fireEvent.keyPress(labelInput, {
    key: 'Enter',
    charCode: 13,
  });
  expect(screen.getByText(/new label/i)).toBeInTheDocument();
});

test('returns to default labels when the custom label is cleared', async () => {
  setup({});
  userEvent.click(screen.getByText('SUM(value)'));
  userEvent.click(screen.getByTestId(/AdhocMetricEditTitle#trigger/i));
  const labelInput = await screen.findByTestId(/AdhocMetricEditTitle#input/i);
  userEvent.clear(labelInput);
  userEvent.type(labelInput, 'new label');
  fireEvent.keyPress(labelInput, {
    key: 'Enter',
    charCode: 13,
  });
  expect(labelInput).not.toBeInTheDocument();
  expect(screen.getByText(/new label/i)).toBeInTheDocument();
  userEvent.click(screen.getByTestId(/AdhocMetricEditTitle#trigger/i));
  expect(screen.getByPlaceholderText(/new label/i)).toBeInTheDocument();
  userEvent.clear(labelInput);
  fireEvent.keyPress(labelInput, {
    key: 'Enter',
    charCode: 13,
  });
  expect(screen.getByPlaceholderText('SUM(value)')).toBeInTheDocument();
});
