import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import { isFeatureEnabled } from '@zobi-ui/core';
import {
  render,
  screen,
  act,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import ShareSqlLabQuery from 'src/SqlLab/components/ShareSqlLabQuery';
import { initialState } from 'src/SqlLab/fixtures';
import { omit } from 'lodash';

const mockStore = configureStore([thunk]);
const defaultProps = {
  queryEditorId: 'qe1',
  addDangerToast: jest.fn(),
};
const mockQueryEditor = {
  id: defaultProps.queryEditorId,
  dbId: 0,
  name: 'query title',
  schema: 'query_schema',
  autorun: false,
  sql: 'SELECT * FROM ...',
  remoteId: 999,
};
const disabled = {
  id: 'disabledEditorId',
  remoteId: undefined,
};

const mockState = {
  ...initialState,
  sqlLab: {
    ...initialState.sqlLab,
    queryEditors: [mockQueryEditor, disabled],
  },
};
const store = mockStore(mockState);

jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  isFeatureEnabled: jest.fn(),
}));

const mockedIsFeatureEnabled = isFeatureEnabled as jest.Mock;

const unsavedQueryEditor = {
  id: defaultProps.queryEditorId,
  dbId: 9888,
  name: 'query title changed',
  schema: 'query_schema_updated',
  sql: 'SELECT * FROM Updated Limit 100',
  autorun: true,
  templateParams: '{ "my_value": "foo" }',
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ShareSqlLabQuery', () => {
  const storeQueryUrl = 'glob:*/api/v1/sqllab/permalink';
  const storeQueryMockId = 'ci39c3';

  beforeEach(async () => {
    fetchMock.removeRoute(storeQueryUrl);
    fetchMock.post(
      storeQueryUrl,
      () => ({ key: storeQueryMockId, url: `/p/${storeQueryMockId}` }),
      { name: storeQueryUrl },
    );
    fetchMock.clearHistory();
    jest.clearAllMocks();
  });

  afterAll(() => fetchMock.hardReset());

  // eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
  describe('via permalink api', () => {
    beforeAll(() => {
      mockedIsFeatureEnabled.mockImplementation(() => true);
    });

    afterAll(() => {
      mockedIsFeatureEnabled.mockReset();
    });

    test('calls storeQuery() with the query when getCopyUrl() is called', async () => {
      await act(async () => {
        render(<ShareSqlLabQuery {...defaultProps} />, {
          useRedux: true,
          store,
        });
      });
      const button = screen.getByRole('button');
      const expected = omit(mockQueryEditor, ['id', 'remoteId']);
      userEvent.click(button);
      await waitFor(() =>
        expect(fetchMock.callHistory.calls(storeQueryUrl)).toHaveLength(1),
      );
      expect(
        JSON.parse(
          fetchMock.callHistory.calls(storeQueryUrl)[0].options?.body as string,
        ),
      ).toEqual(expected);
    });

    test('does not show duplicate "Copy to clipboard" tooltip on hover', async () => {
      await act(async () => {
        render(<ShareSqlLabQuery {...defaultProps} />, {
          useRedux: true,
          store,
        });
      });
      const button = screen.getByRole('button');
      userEvent.hover(button);
      expect(
        await screen.findByText('Copy query link to your clipboard'),
      ).toBeInTheDocument();
      await waitFor(() => {
        // CopyToClipboard default tooltip must NOT appear —
        // only the Button-level "Copy query link to your clipboard" should show.
        expect(screen.queryByText('Copy to clipboard')).not.toBeInTheDocument();
      });
    });

    test('calls storeQuery() with unsaved changes', async () => {
      await act(async () => {
        render(<ShareSqlLabQuery {...defaultProps} />, {
          useRedux: true,
          store: mockStore({
            ...initialState,
            sqlLab: {
              ...initialState.sqlLab,
              unsavedQueryEditor,
            },
          }),
        });
      });
      const button = screen.getByRole('button');
      const expected = omit(unsavedQueryEditor, ['id']);
      userEvent.click(button);
      await waitFor(() =>
        expect(fetchMock.callHistory.calls(storeQueryUrl)).toHaveLength(1),
      );
      expect(
        JSON.parse(
          fetchMock.callHistory.calls(storeQueryUrl)[0].options?.body as string,
        ),
      ).toEqual(expected);
    });
  });
});
