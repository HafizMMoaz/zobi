
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Store } from 'redux';
import {
  render,
  fireEvent,
  getByText,
  waitFor,
} from 'spec/helpers/testing-library';
import { initialState, defaultQueryEditor } from 'src/SqlLab/fixtures';

import TemplateParamsEditor, {
  TemplateParamsEditorProps,
} from 'src/SqlLab/components/TemplateParamsEditor';

jest.mock('@zobi.dev/core/components/Select/Select', () => () => (
  <div data-test="mock-deprecated-select-select" />
));
jest.mock('@zobi.dev/core/components/Select/AsyncSelect', () => () => (
  <div data-test="mock-async-select" />
));
jest.mock('src/core/editors', () => ({
  EditorHost: ({ value }: { value: string }) => (
    <div data-test="mock-async-ace-editor">{value}</div>
  ),
}));

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const setup = (
  otherProps: Partial<TemplateParamsEditorProps> = {},
  store?: Store,
) =>
  render(
    <TemplateParamsEditor
      language="json"
      onChange={() => {}}
      queryEditorId={defaultQueryEditor.id}
      {...otherProps}
    />,
    {
      useRedux: true,
      store: mockStore(initialState),
      ...(store && { store }),
    },
  );

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('TemplateParamsEditor', () => {
  test('should render with a title', () => {
    const { container } = setup();
    expect(container.querySelector('div[role="button"]')).toBeInTheDocument();
  });

  test('should open a modal with the ace editor', async () => {
    const { container, getByTestId } = setup();
    fireEvent.click(getByText(container, 'Parameters'));
    await waitFor(() => {
      expect(getByTestId('mock-async-ace-editor')).toBeInTheDocument();
    });
  });

  test('renders templateParams', async () => {
    const { container, getByTestId } = setup();
    fireEvent.click(getByText(container, 'Parameters'));
    await waitFor(() => {
      expect(getByTestId('mock-async-ace-editor')).toBeInTheDocument();
    });
    expect(getByTestId('mock-async-ace-editor')).toHaveTextContent(
      defaultQueryEditor.templateParams,
    );
  });

  test('renders code from unsaved changes', async () => {
    const expectedCode = 'custom code value';
    const { container, getByTestId } = setup(
      {},
      mockStore({
        ...initialState,
        sqlLab: {
          ...initialState.sqlLab,
          unsavedQueryEditor: {
            id: defaultQueryEditor.id,
            templateParams: expectedCode,
          },
        },
      }),
    );
    fireEvent.click(getByText(container, 'Parameters'));
    await waitFor(() => {
      expect(getByTestId('mock-async-ace-editor')).toBeInTheDocument();
    });
    expect(getByTestId('mock-async-ace-editor')).toHaveTextContent(
      expectedCode,
    );
  });
});
