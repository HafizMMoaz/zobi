
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import mockState from 'spec/fixtures/mockState';
import reducerIndex from 'spec/helpers/reducerIndex';
import { screen, render } from 'spec/helpers/testing-library';
import { initialState } from 'src/SqlLab/fixtures';
import useFilterFocusHighlightStyles from './useFilterFocusHighlightStyles';
import { getRelatedCharts } from './getRelatedCharts';

jest.mock('./getRelatedCharts');

const TestComponent = ({ chartId }: { chartId: number }) => {
  const styles = useFilterFocusHighlightStyles(chartId);

  return <div data-test="test-component" style={styles} />;
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('useFilterFocusHighlightStyles', () => {
  const createMockStore = (customState: any = {}) =>
    createStore(
      combineReducers(reducerIndex),
      { ...mockState, ...(initialState as any), ...customState },
      compose(applyMiddleware(thunk)),
    );
  const mockGetRelatedCharts = getRelatedCharts as jest.Mock;

  const renderWrapper = (chartId: number, store = createMockStore()) =>
    render(<TestComponent chartId={chartId} />, {
      useRouter: true,
      useDnd: true,
      useRedux: true,
      store,
    });

  test('should return no style if filter not in scope', async () => {
    renderWrapper(10);

    const container = screen.getByTestId('test-component');

    const styles = getComputedStyle(container);
    expect(styles.opacity).toBeFalsy();
  });

  test('should return unfocused styles if chart is not in scope of focused native filter', async () => {
    mockGetRelatedCharts.mockReturnValue([]);
    const store = createMockStore({
      nativeFilters: {
        focusedFilterId: 'test-filter',
        filters: {
          otherId: {
            id: 'NATIVE_FILTER-otherId',
            chartsInScope: [],
          },
        },
      },
    });
    renderWrapper(10, store);

    const container = screen.getByTestId('test-component');

    const styles = getComputedStyle(container);
    expect(parseFloat(styles.opacity)).toBe(0.3);
  });

  test('should return unfocused styles if chart is not in scope of hovered native filter', async () => {
    mockGetRelatedCharts.mockReturnValue([]);
    const store = createMockStore({
      nativeFilters: {
        hoveredFilterId: 'test-filter',
        filters: {
          otherId: {
            id: 'NATIVE_FILTER-otherId',
            chartsInScope: [],
          },
        },
      },
    });
    renderWrapper(10, store);

    const container = screen.getByTestId('test-component');

    const styles = getComputedStyle(container);
    expect(parseFloat(styles.opacity)).toBe(0.3);
  });

  test('should return focused styles if chart is in scope of focused native filter', async () => {
    const chartId = 18;
    mockGetRelatedCharts.mockReturnValue([chartId]);
    const store = createMockStore({
      nativeFilters: {
        focusedFilterId: 'testFilter',
        filters: {
          testFilter: {
            id: 'NATIVE_FILTER-testFilter',
            chartsInScope: [chartId],
          },
        },
      },
    });
    renderWrapper(chartId, store);

    const container = screen.getByTestId('test-component');

    const styles = getComputedStyle(container);
    expect(parseFloat(styles.opacity)).toBe(1);
  });

  test('should return focused styles if chart is in scope of hovered native filter', async () => {
    const chartId = 18;
    mockGetRelatedCharts.mockReturnValue([chartId]);
    const store = createMockStore({
      nativeFilters: {
        hoveredFilterId: 'testFilter',
        filters: {
          testFilter: {
            id: 'NATIVE_FILTER-testFilter',
            chartsInScope: [chartId],
          },
        },
      },
    });
    renderWrapper(chartId, store);

    const container = screen.getByTestId('test-component');

    const styles = getComputedStyle(container);
    expect(parseFloat(styles.opacity)).toBe(1);
  });
});
