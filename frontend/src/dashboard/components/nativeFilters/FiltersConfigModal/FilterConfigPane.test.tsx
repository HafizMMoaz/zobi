import { dashboardLayout } from 'spec/fixtures/mockDashboardLayout';
import { buildNativeFilter } from 'spec/fixtures/mockNativeFilters';
import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import FilterConfigPane from './FilterConfigurePane';

const scrollMock = jest.fn();
Element.prototype.scroll = scrollMock;

const defaultProps = {
  getFilterTitle: (id: string) => id,
  onChange: jest.fn(),
  onAdd: jest.fn(),
  onRemove: jest.fn(),
  onRearrange: jest.fn(),
  restoreFilter: jest.fn(),
  currentFilterId: 'NATIVE_FILTER-1',
  filters: ['NATIVE_FILTER-1', 'NATIVE_FILTER-2', 'NATIVE_FILTER-3'],
  removedFilters: {},
  erroredFilters: [],
};
const defaultState = {
  dashboardInfo: {
    metadata: {
      native_filter_configuration: [
        buildNativeFilter('NATIVE_FILTER-1', 'state', ['NATIVE_FILTER-2']),
        buildNativeFilter('NATIVE_FILTER-2', 'country', []),
        buildNativeFilter('NATIVE_FILTER-3', 'product', []),
      ],
    },
  },
  dashboardLayout,
};

function defaultRender(initialState: any = defaultState, props = defaultProps) {
  return render(<FilterConfigPane {...props} />, {
    initialState,
    useDnd: true,
    useRedux: true,
  });
}

beforeEach(() => {
  scrollMock.mockClear();
});

test('drag and drop', () => {
  defaultRender();
  const dragIcons = document.querySelectorAll('[alt="Move icon"]');
  expect(dragIcons.length).toBe(3);

  expect(screen.getByText('NATIVE_FILTER-1')).toBeInTheDocument();
  expect(screen.getByText('NATIVE_FILTER-2')).toBeInTheDocument();
  expect(screen.getByText('NATIVE_FILTER-3')).toBeInTheDocument();

  const filterContainer = screen.getByTestId('filter-title-container');
  expect(filterContainer).toBeInTheDocument();
});

test('remove filter', async () => {
  defaultRender();
  // First trash icon
  const removeFilterIcon = document.querySelector("[alt='Remove filter']")!;
  userEvent.click(removeFilterIcon);
  expect(defaultProps.onRemove).toHaveBeenCalledWith('NATIVE_FILTER-1');
});

test('add filter', async () => {
  defaultRender();
  // First trash icon
  const addFilterButton = await screen.findByText('Add filter');
  userEvent.click(addFilterButton);
  expect(defaultProps.onAdd).toHaveBeenCalledWith('NATIVE_FILTER');
});

test('add divider', async () => {
  defaultRender();
  const addFilterButton = await screen.findByText('Add divider');
  userEvent.click(addFilterButton);
  expect(defaultProps.onAdd).toHaveBeenCalledWith('DIVIDER');
});

test('filter container should scroll to bottom when adding items', async () => {
  const state = {
    dashboardInfo: {
      metadata: {
        native_filter_configuration: Array.from({ length: 35 }, (_, index) =>
          buildNativeFilter(`NATIVE_FILTER-${index}`, `filter-${index}`, []),
        ),
      },
    },
    dashboardLayout,
  };
  const props = {
    ...defaultProps,
    filters: Array.from({ length: 35 }, (_, index) => `NATIVE_FILTER-${index}`),
  };

  defaultRender(state, props);

  const addFilterButton = await screen.findByText('Add filter');

  userEvent.click(addFilterButton);

  await waitFor(() => {
    const containerElement = screen.getByTestId('filter-title-container');
    expect(containerElement.scroll).toHaveBeenCalled();
  });
});
