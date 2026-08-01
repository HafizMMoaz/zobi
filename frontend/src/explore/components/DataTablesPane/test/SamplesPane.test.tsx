import fetchMock from 'fetch-mock';
import { render, waitFor } from 'spec/helpers/testing-library';
import { setupAGGridModules } from '@zobi-ui/core/components/ThemedAgGridReact';
import { SamplesPane } from '../components';
import { createSamplesPaneProps } from './fixture';

beforeAll(() => {
  setupAGGridModules();
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('SamplesPane', () => {
  fetchMock.post(
    'end:/datasource/samples?force=false&datasource_type=table&datasource_id=34&per_page=100&page=1',
    {
      result: {
        data: [],
        colnames: [],
        coltypes: [],
      },
    },
  );

  fetchMock.post(
    'end:/datasource/samples?force=true&datasource_type=table&datasource_id=35&per_page=100&page=1',
    {
      result: {
        data: [
          { __timestamp: 1230768000000, genre: 'Action' },
          { __timestamp: 1230768000010, genre: 'Horror' },
        ],
        colnames: ['__timestamp', 'genre'],
        coltypes: [2, 1],
        rowcount: 2,
        sql_rowcount: 2,
      },
    },
  );

  fetchMock.post(
    'end:/datasource/samples?force=false&datasource_type=table&datasource_id=36&per_page=100&page=1',
    400,
  );

  const setForceQuery = jest.fn();

  afterAll(() => {
    fetchMock.clearHistory().removeRoutes();
    jest.resetAllMocks();
  });

  test('render', async () => {
    const props = createSamplesPaneProps({ datasourceId: 34 });
    const { findByText } = render(
      <SamplesPane {...props} setForceQuery={setForceQuery} />,
    );
    expect(
      await findByText('No samples were returned for this dataset'),
    ).toBeVisible();
    await waitFor(() => {
      expect(setForceQuery).toHaveBeenCalledTimes(0);
    });
  });

  test('error response', async () => {
    const props = createSamplesPaneProps({
      datasourceId: 36,
    });
    const { findByText } = render(<SamplesPane {...props} />, {
      useRedux: true,
    });

    expect(await findByText('Error: Bad request')).toBeVisible();
  });

  test('force query, render', async () => {
    const props = createSamplesPaneProps({
      datasourceId: 35,
      queryForce: true,
    });
    const { queryByText } = render(
      <SamplesPane {...props} setForceQuery={setForceQuery} />,
      {
        useRedux: true,
      },
    );

    await waitFor(() => {
      expect(setForceQuery).toHaveBeenCalledTimes(1);
    });
    expect(queryByText('2 rows')).toBeVisible();
    expect(queryByText('Action')).toBeVisible();
    expect(queryByText('Horror')).toBeVisible();
  });
});
