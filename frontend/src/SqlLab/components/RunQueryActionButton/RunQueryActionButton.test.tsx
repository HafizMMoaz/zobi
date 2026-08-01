import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Store } from 'redux';

import { render, fireEvent, waitFor } from 'spec/helpers/testing-library';
import { initialState, defaultQueryEditor } from 'src/SqlLab/fixtures';
import RunQueryActionButton, {
  RunQueryActionButtonProps,
} from 'src/SqlLab/components/RunQueryActionButton';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('@zobi-ui/core/components/Select/Select', () => () => (
  <div data-test="mock-deprecated-select-select" />
));
jest.mock('@zobi-ui/core/components/Select/AsyncSelect', () => () => (
  <div data-test="mock-deprecated-async-select" />
));

const defaultProps = {
  queryEditorId: defaultQueryEditor.id,
  dbId: 1,
  queryState: 'ready',
  runQuery: () => {},
  selectedText: null,
  stopQuery: () => {},
  overlayCreateAsMenu: null,
};

const setup = (props?: Partial<RunQueryActionButtonProps>, store?: Store) =>
  render(<RunQueryActionButton {...defaultProps} {...props} />, {
    useRedux: true,
    ...(store && { store }),
  });

test('renders a single Button', () => {
  const { getByRole } = setup({}, mockStore(initialState));
  expect(getByRole('button')).toBeInTheDocument();
});

test('renders a label for Run Query', () => {
  const { getByText } = setup({}, mockStore(initialState));
  expect(getByText('Run')).toBeInTheDocument();
});

test('renders a label for Selected Query', () => {
  const { getByText } = setup(
    {},
    mockStore({
      ...initialState,
      sqlLab: {
        ...initialState.sqlLab,
        unsavedQueryEditor: {
          id: defaultQueryEditor.id,
          selectedText: 'select * from\n-- this is comment\nwhere',
        },
      },
    }),
  );
  expect(getByText('Run selection')).toBeInTheDocument();
});

test('disable button when sql from unsaved changes is empty', () => {
  const { getByRole } = setup(
    {},
    mockStore({
      ...initialState,
      sqlLab: {
        ...initialState.sqlLab,
        unsavedQueryEditor: {
          id: defaultQueryEditor.id,
          sql: '',
        },
      },
    }),
  );
  const button = getByRole('button');
  expect(button).toBeDisabled();
});

test('disable button when selectedText only contains blank contents', () => {
  const { getByRole } = setup(
    {},
    mockStore({
      ...initialState,
      sqlLab: {
        ...initialState.sqlLab,
        unsavedQueryEditor: {
          id: defaultQueryEditor.id,
          selectedText: '-- this is comment\n\n     \t',
        },
      },
    }),
  );
  const button = getByRole('button');
  expect(button).toBeDisabled();
});

test('enable default button for unrelated unsaved changes', () => {
  const { getByRole } = setup(
    {},
    mockStore({
      ...initialState,
      sqlLab: {
        ...initialState.sqlLab,
        unsavedQueryEditor: {
          id: `${defaultQueryEditor.id}-other`,
          sql: '',
        },
      },
    }),
  );
  const button = getByRole('button');
  expect(button).toBeEnabled();
});

test('dispatch runQuery on click', async () => {
  const runQuery = jest.fn();
  const { getByRole } = setup({ runQuery }, mockStore(initialState));
  const button = getByRole('button');
  expect(runQuery).toHaveBeenCalledTimes(0);
  fireEvent.click(button);
  await waitFor(() => expect(runQuery).toHaveBeenCalledTimes(1));
});

test('dispatch stopQuery on click while running state', async () => {
  const stopQuery = jest.fn();
  const { getByRole } = setup(
    { queryState: 'running', stopQuery },
    mockStore(initialState),
  );
  const button = getByRole('button');
  expect(stopQuery).toHaveBeenCalledTimes(0);
  fireEvent.click(button);
  await waitFor(() => expect(stopQuery).toHaveBeenCalledTimes(1));
});
