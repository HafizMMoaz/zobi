import { type ReactChild } from 'react';
import fetchMock from 'fetch-mock';
import { table, initialState } from 'src/SqlLab/fixtures';
import {
  render,
  waitFor,
  fireEvent,
  screen,
} from 'spec/helpers/testing-library';
import TablePreview from '.';

jest.mock('src/components/FilterableTable', () => ({
  __esModule: true,
  FilterableTable: ({ data }: { data: Record<string, any>[] }) => (
    <div>
      {data.map((record, i) => (
        <div key={i} data-test="mock-record-row">
          {JSON.stringify(record)}
        </div>
      ))}
    </div>
  ),
}));
jest.mock(
  'react-virtualized-auto-sizer',
  () =>
    ({ children }: { children: (params: { height: number }) => ReactChild }) =>
      children({ height: 500 }),
);
jest.mock('@zobi-ui/core/components/IconTooltip', () => ({
  IconTooltip: ({
    onClick,
    tooltip,
  }: {
    onClick: () => void;
    tooltip: string;
  }) => (
    <button type="button" data-test="mock-icon-tooltip" onClick={onClick}>
      {tooltip}
    </button>
  ),
}));
const getTableMetadataEndpoint =
  /\/api\/v1\/database\/\d+\/table_metadata\/(?:\?.*)?$/;
const getExtraTableMetadataEndpoint =
  /\/api\/v1\/database\/\d+\/table_metadata\/extra\/(?:\?.*)?$/;
const fetchPreviewEndpoint = 'glob:*/api/v1/sqllab/execute/';

beforeEach(() => {
  fetchMock.get(getTableMetadataEndpoint, table);
  fetchMock.get(getExtraTableMetadataEndpoint, {});
  fetchMock.post(fetchPreviewEndpoint, `{ "data": 123 }`);
});

afterEach(() => {
  fetchMock.clearHistory().removeRoutes();
});

const mockedProps = {
  dbId: table.dbId,
  catalog: table.catalog,
  schema: table.schema,
  tableName: table.name,
};

test('renders columns', async () => {
  const { getAllByTestId, queryByText } = render(
    <TablePreview {...mockedProps} />,
    {
      useRedux: true,
      initialState,
    },
  );
  await waitFor(() =>
    expect(getAllByTestId('mock-record-row')).toHaveLength(
      table.columns.length,
    ),
  );
  expect(queryByText(`Columns (${table.columns.length})`)).toBeInTheDocument();
});

test('renders indexes', async () => {
  const { queryByText } = render(<TablePreview {...mockedProps} />, {
    useRedux: true,
    initialState,
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(getTableMetadataEndpoint)).toHaveLength(
      1,
    ),
  );
  expect(queryByText(`Indexes (${table.indexes.length})`)).toBeInTheDocument();
});

test('renders preview', async () => {
  const { getByText } = render(<TablePreview {...mockedProps} />, {
    useRedux: true,
    initialState: {
      ...initialState,
      sqlLab: {
        ...initialState.sqlLab,
        databases: {
          [table.dbId]: {
            id: table.dbId,
            database_name: 'mysql',
            disable_data_preview: false,
          },
        },
      },
    },
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(getTableMetadataEndpoint)).toHaveLength(
      1,
    ),
  );
  expect(fetchMock.callHistory.calls(fetchPreviewEndpoint)).toHaveLength(0);
  fireEvent.click(getByText('Data preview'));
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(fetchPreviewEndpoint)).toHaveLength(1),
  );
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('table actions', () => {
  test('refreshes table metadata when triggered', async () => {
    const { getByRole } = render(<TablePreview {...mockedProps} />, {
      useRedux: true,
      initialState,
    });
    await waitFor(() =>
      expect(
        fetchMock.callHistory.calls(getTableMetadataEndpoint),
      ).toHaveLength(1),
    );
    const refreshButton = getByRole('button', { name: 'sync' });
    fireEvent.click(refreshButton);
    await waitFor(() =>
      expect(
        fetchMock.callHistory.calls(getTableMetadataEndpoint),
      ).toHaveLength(2),
    );
  });

  test('shows CREATE VIEW statement', async () => {
    const { getByRole } = render(<TablePreview {...mockedProps} />, {
      useRedux: true,
      initialState,
    });
    await waitFor(() =>
      expect(
        fetchMock.callHistory.calls(getTableMetadataEndpoint),
      ).toHaveLength(1),
    );
    const viewButton = getByRole('button', { name: 'eye' });
    fireEvent.click(viewButton);
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'CREATE VIEW statement' }),
      ).toBeInTheDocument(),
    );
  });
});
