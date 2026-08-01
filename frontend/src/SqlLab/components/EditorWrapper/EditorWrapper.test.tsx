import reducerIndex from 'spec/helpers/reducerIndex';
import {
  render,
  waitFor,
  createStore,
  act,
} from 'spec/helpers/testing-library';
import { QueryEditor } from 'src/SqlLab/types';
import { Store } from 'redux';
import { initialState, defaultQueryEditor } from 'src/SqlLab/fixtures';
import EditorWrapper from 'src/SqlLab/components/EditorWrapper';
import type { editors } from '@zobi.dev/extension-api';
import {
  queryEditorSetCursorPosition,
  queryEditorSetDb,
  queryEditorSetSelectedText,
} from 'src/SqlLab/actions/sqlLab';
import fetchMock from 'fetch-mock';

fetchMock.get('glob:*/api/v1/database/*/function_names/', {
  function_names: [],
});

jest.mock('@zobi.dev/core/components/Select/Select', () => () => (
  <div data-test="mock-deprecated-select-select" />
));
jest.mock('@zobi.dev/core/components/Select/AsyncSelect', () => () => (
  <div data-test="mock-deprecated-async-select" />
));

// Mock EditorHost from the editors module
const MockEditorHost = jest
  .fn()
  .mockImplementation((props: editors.EditorProps) => (
    <div data-test="editor-host">{JSON.stringify(props)}</div>
  ));

jest.mock('src/core/editors', () => ({
  ...jest.requireActual('src/core/editors'),
  EditorHost: (props: editors.EditorProps) => MockEditorHost(props),
}));

const setup = (queryEditor: QueryEditor, store?: Store) =>
  render(
    <EditorWrapper
      queryEditorId={queryEditor.id}
      height="100px"
      hotkeys={[]}
      onChange={jest.fn()}
      onBlur={jest.fn()}
      autocomplete
      onCursorPositionChange={jest.fn()}
    />,
    {
      useRedux: true,
      ...(store && { store }),
    },
  );

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('EditorWrapper', () => {
  beforeEach(() => {
    MockEditorHost.mockClear();
  });

  test('renders editor including sql value', async () => {
    const store = createStore(initialState, reducerIndex);
    const { getByTestId } = setup(defaultQueryEditor, store);
    await waitFor(() => expect(getByTestId('editor-host')).toBeInTheDocument());

    expect(getByTestId('editor-host')).toHaveTextContent(
      JSON.stringify({ value: defaultQueryEditor.sql }).slice(1, -1),
    );
  });

  test('renders current sql for unrelated unsaved changes', () => {
    const expectedSql = 'SELECT updated_column\nFROM updated_table\nWHERE';
    const store = createStore(
      {
        ...initialState,
        sqlLab: {
          ...initialState.sqlLab,
          unsavedQueryEditor: {
            id: `${defaultQueryEditor.id}-other`,
            sql: expectedSql,
          },
        },
      },
      reducerIndex,
    );
    const { getByTestId } = setup(defaultQueryEditor, store);

    expect(getByTestId('editor-host')).not.toHaveTextContent(
      JSON.stringify({ value: expectedSql }).slice(1, -1),
    );
    expect(getByTestId('editor-host')).toHaveTextContent(
      JSON.stringify({ value: defaultQueryEditor.sql }).slice(1, -1),
    );
  });

  test('skips rerendering for updating cursor position', async () => {
    const store = createStore(initialState, reducerIndex);
    setup(defaultQueryEditor, store);

    await waitFor(() => expect(MockEditorHost).toHaveBeenCalled());
    const renderCountBeforeCursor = MockEditorHost.mock.calls.length;
    const updatedCursorPosition = { row: 1, column: 9 };
    act(() => {
      store.dispatch(
        queryEditorSetCursorPosition(defaultQueryEditor, updatedCursorPosition),
      );
    });
    // Cursor position change should NOT trigger a re-render
    expect(MockEditorHost).toHaveBeenCalledTimes(renderCountBeforeCursor);

    const renderCountBeforeDb = MockEditorHost.mock.calls.length;
    act(() => {
      store.dispatch(queryEditorSetDb(defaultQueryEditor, 2));
    });
    // DB change SHOULD trigger a re-render
    await waitFor(() =>
      expect(MockEditorHost.mock.calls.length).toBeGreaterThan(
        renderCountBeforeDb,
      ),
    );
  });

  test('clears selectedText when selection becomes empty', async () => {
    const store = createStore(initialState, reducerIndex);
    // Set initial selected text in store
    store.dispatch(
      queryEditorSetSelectedText(defaultQueryEditor, 'SELECT * FROM table'),
    );
    setup(defaultQueryEditor, store);

    await waitFor(() => expect(MockEditorHost).toHaveBeenCalled());

    // Get the onSelectionChange and onReady callbacks from the mock
    const lastCall =
      MockEditorHost.mock.calls[MockEditorHost.mock.calls.length - 1][0];
    const { onSelectionChange, onReady } = lastCall;

    // Simulate editor ready with a mock handle that returns empty selection
    const mockHandle = {
      getSelectedText: jest.fn().mockReturnValue(''),
      getValue: jest.fn().mockReturnValue(''),
      setValue: jest.fn(),
      focus: jest.fn(),
      moveCursorToPosition: jest.fn(),
      scrollToLine: jest.fn(),
    };
    act(() => {
      onReady(mockHandle);
    });

    // Simulate selection change with empty selection (cursor moved without selecting)
    act(() => {
      onSelectionChange([
        { start: { line: 0, column: 5 }, end: { line: 0, column: 5 } },
      ]);
    });

    // Verify selectedText was cleared in the store
    await waitFor(() => {
      const state = store.getState() as unknown as {
        sqlLab: { queryEditors: QueryEditor[] };
      };
      const editor = state.sqlLab.queryEditors.find(
        qe => qe.id === defaultQueryEditor.id,
      );
      expect(editor?.selectedText).toBeFalsy();
    });
  });
});
