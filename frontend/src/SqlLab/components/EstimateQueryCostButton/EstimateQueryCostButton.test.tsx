import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, render } from 'spec/helpers/testing-library';
import { Store } from 'redux';
import {
  initialState,
  defaultQueryEditor,
  extraQueryEditor1,
} from 'src/SqlLab/fixtures';

import EstimateQueryCostButton, {
  EstimateQueryCostButtonProps,
} from 'src/SqlLab/components/EstimateQueryCostButton';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('@zobi.dev/core/components/Select/Select', () => () => (
  <div data-test="mock-deprecated-select-select" />
));
jest.mock('@zobi.dev/core/components/Select/AsyncSelect', () => () => (
  <div data-test="mock-deprecated-async-select" />
));

const setup = (props: Partial<EstimateQueryCostButtonProps>, store?: Store) =>
  render(
    <EstimateQueryCostButton
      queryEditorId={defaultQueryEditor.id}
      getEstimate={jest.fn()}
      {...props}
    />,
    {
      useRedux: true,
      ...(store && { store }),
    },
  );

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('EstimateQueryCostButton', () => {
  test('renders EstimateQueryCostButton', async () => {
    const { queryByLabelText } = setup({}, mockStore(initialState));

    expect(queryByLabelText('Estimate cost')).toBeInTheDocument();
  });

  test('renders label for selected query', async () => {
    const { queryByLabelText } = setup(
      { queryEditorId: extraQueryEditor1.id },
      mockStore(initialState),
    );

    expect(
      queryByLabelText('Estimate selected query cost'),
    ).toBeInTheDocument();
  });

  test('renders label for selected query from unsaved', async () => {
    const { queryByLabelText } = setup(
      {},
      mockStore({
        ...initialState,
        sqlLab: {
          ...initialState.sqlLab,
          unsavedQueryEditor: {
            id: defaultQueryEditor.id,
            selectedText: 'SELECT',
          },
        },
      }),
    );

    expect(
      queryByLabelText('Estimate selected query cost'),
    ).toBeInTheDocument();
  });

  test('renders estimation error result', async () => {
    const { queryByLabelText, queryByText, getByLabelText } = setup(
      {},
      mockStore({
        ...initialState,
        sqlLab: {
          ...initialState.sqlLab,
          queryCostEstimates: {
            [defaultQueryEditor.id]: {
              error: 'Estimate error',
            },
          },
        },
      }),
    );

    expect(queryByLabelText('Estimate cost')).toBeInTheDocument();
    fireEvent.click(getByLabelText('Estimate cost'));

    expect(queryByText('Estimate error')).toBeInTheDocument();
  });

  test('renders estimation success result', async () => {
    const { queryByLabelText, getByLabelText, findByTitle } = setup(
      {},
      mockStore({
        ...initialState,
        sqlLab: {
          ...initialState.sqlLab,
          queryCostEstimates: {
            [defaultQueryEditor.id]: {
              completed: true,
              cost: [{ 'Total cost': '1.2' }],
            },
          },
        },
      }),
    );

    expect(queryByLabelText('Estimate cost')).toBeInTheDocument();
    fireEvent.click(getByLabelText('Estimate cost'));
    const totalCostTitle = await findByTitle('Total cost');
    expect(totalCostTitle).toBeInTheDocument();
  });
});
