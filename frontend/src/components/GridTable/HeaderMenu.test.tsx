import type { Column, GridApi } from 'ag-grid-community';
import {
  render,
  waitFor,
  screen,
  userEvent,
} from 'spec/helpers/testing-library';
import { HeaderMenu, type HeaderMenuProps } from './HeaderMenu';

jest.mock('src/utils/copy', () => jest.fn().mockImplementation(f => f()));

const mockInvisibleColumn = {
  getColId: jest.fn().mockReturnValue('column2'),
  getColDef: jest.fn().mockReturnValue({ headerName: 'column2' }),
  getDataAsCsv: jest.fn().mockReturnValue('csv'),
} as any as Column;

const mockInvisibleColumn3 = {
  getColId: jest.fn().mockReturnValue('column3'),
  getColDef: jest.fn().mockReturnValue({ headerName: 'column3' }),
  getDataAsCsv: jest.fn().mockReturnValue('csv'),
} as any as Column;

const mockGridApi = {
  autoSizeColumns: jest.fn(),
  autoSizeAllColumns: jest.fn(),
  getColumn: jest.fn().mockReturnValue({
    getColDef: jest.fn().mockReturnValue({}),
  }),
  getColumns: jest.fn().mockReturnValue([]),
  getDataAsCsv: jest.fn().mockReturnValue('csv'),
  exportDataAsCsv: jest.fn().mockReturnValue('csv'),
  getAllDisplayedColumns: jest.fn().mockReturnValue([]),
  setColumnsPinned: jest.fn(),
  setColumnsVisible: jest.fn(),
  setColumnVisible: jest.fn(),
  moveColumns: jest.fn(),
} as any as GridApi;

const mockedProps = {
  colId: 'column1',
  invisibleColumns: [],
  api: mockGridApi,
  onVisibleChange: jest.fn(),
};

afterEach(() => {
  (mockGridApi.getDataAsCsv as jest.Mock).mockClear();
  (mockGridApi.setColumnsPinned as jest.Mock).mockClear();
  (mockGridApi.setColumnsVisible as jest.Mock).mockClear();
  (mockGridApi.setColumnsVisible as jest.Mock).mockClear();
  (mockGridApi.setColumnsPinned as jest.Mock).mockClear();
  (mockGridApi.autoSizeColumns as jest.Mock).mockClear();
  (mockGridApi.autoSizeAllColumns as jest.Mock).mockClear();
  (mockGridApi.moveColumns as jest.Mock).mockClear();
});

const setup = (props: HeaderMenuProps = mockedProps) => {
  const wrapper = render(<HeaderMenu {...props} />);
  const dropdownTrigger = wrapper.getByTestId('dropdown-trigger');
  userEvent.click(dropdownTrigger);

  return wrapper;
};

test('renders copy data', async () => {
  const { getByText } = setup();
  userEvent.click(getByText('Copy'));
  await waitFor(() =>
    expect(mockGridApi.getDataAsCsv).toHaveBeenCalledTimes(1),
  );
  expect(mockGridApi.getDataAsCsv).toHaveBeenCalledWith({
    columnKeys: [mockedProps.colId],
    suppressQuotes: true,
  });
});

test('renders buttons pinning both sides', () => {
  const { queryByText, getByText } = setup();
  expect(queryByText('Pin Left')).toBeInTheDocument();
  expect(queryByText('Pin Right')).toBeInTheDocument();
  userEvent.click(getByText('Pin Left'));
  expect(mockGridApi.setColumnsPinned).toHaveBeenCalledTimes(1);
  expect(mockGridApi.setColumnsPinned).toHaveBeenCalledWith(
    [mockedProps.colId],
    'left',
  );
  userEvent.click(getByText('Pin Right'));
  expect(mockGridApi.setColumnsPinned).toHaveBeenLastCalledWith(
    [mockedProps.colId],
    'right',
  );
});

test('renders unpin on pinned left', () => {
  const { queryByText, getByText } = setup({
    ...mockedProps,
    pinnedLeft: true,
  });
  expect(queryByText('Pin Left')).not.toBeInTheDocument();
  expect(queryByText('Unpin')).toBeInTheDocument();
  userEvent.click(getByText('Unpin'));
  expect(mockGridApi.setColumnsPinned).toHaveBeenCalledTimes(1);
  expect(mockGridApi.setColumnsPinned).toHaveBeenCalledWith(
    [mockedProps.colId],
    null,
  );
});

test('renders unpin on pinned right', () => {
  const { queryByText } = setup({ ...mockedProps, pinnedRight: true });
  expect(queryByText('Pin Right')).not.toBeInTheDocument();
  expect(queryByText('Unpin')).toBeInTheDocument();
});

test('renders autosize column', async () => {
  const { getByText } = setup();
  userEvent.click(getByText('Autosize Column'));
  await waitFor(() =>
    expect(mockGridApi.autoSizeColumns).toHaveBeenCalledTimes(1),
  );
});

test('renders unhide when invisible column exists', async () => {
  const { queryByText, getByText } = setup({
    ...mockedProps,
    invisibleColumns: [mockInvisibleColumn],
  });
  expect(queryByText('Unhide')).toBeInTheDocument();
  userEvent.click(getByText('Unhide'));
  const unhideColumnsButton = await screen.findByText('column2');
  userEvent.click(unhideColumnsButton);
  expect(mockGridApi.setColumnsVisible).toHaveBeenCalledTimes(1);
  expect(mockGridApi.setColumnsVisible).toHaveBeenCalledWith(['column2'], true);
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('for main menu', () => {
  test('renders Copy to Clipboard', async () => {
    const { getByText } = setup({ ...mockedProps, isMain: true });
    userEvent.click(getByText('Copy the current data'));
    await waitFor(() =>
      expect(mockGridApi.getDataAsCsv).toHaveBeenCalledTimes(1),
    );
    expect(mockGridApi.getDataAsCsv).toHaveBeenCalledWith({
      columnKeys: [],
      columnSeparator: '\t',
      suppressQuotes: true,
    });
  });

  test('renders Download to CSV', async () => {
    const { getByText } = setup({ ...mockedProps, isMain: true });
    userEvent.click(getByText('Download to CSV'));
    await waitFor(() =>
      expect(mockGridApi.exportDataAsCsv).toHaveBeenCalledTimes(1),
    );
    expect(mockGridApi.exportDataAsCsv).toHaveBeenCalledWith({
      columnKeys: [],
    });
  });

  test('renders autosize column', async () => {
    const { getByText } = setup({ ...mockedProps, isMain: true });
    userEvent.click(getByText('Autosize all columns'));
    await waitFor(() =>
      expect(mockGridApi.autoSizeAllColumns).toHaveBeenCalledTimes(1),
    );
  });

  test('renders all unhide all hidden columns when multiple invisible columns exist', async () => {
    setup({
      ...mockedProps,
      isMain: true,
      invisibleColumns: [mockInvisibleColumn, mockInvisibleColumn3],
    });
    userEvent.click(screen.getByText('Unhide'));
    const unhideColumnsButton = await screen.findByText(`All 2 hidden columns`);
    userEvent.click(unhideColumnsButton);
    expect(mockGridApi.setColumnsVisible).toHaveBeenCalledTimes(1);
    expect(mockGridApi.setColumnsVisible).toHaveBeenCalledWith(
      [mockInvisibleColumn, mockInvisibleColumn3],
      true,
    );
  });

  test('reset columns configuration', async () => {
    const { getByText } = setup({
      ...mockedProps,
      isMain: true,
      invisibleColumns: [mockInvisibleColumn],
    });
    userEvent.click(getByText('Reset columns'));
    await waitFor(() =>
      expect(mockGridApi.setColumnsVisible).toHaveBeenCalledTimes(1),
    );
    expect(mockGridApi.setColumnsVisible).toHaveBeenCalledWith(
      [mockInvisibleColumn],
      true,
    );
    expect(mockGridApi.setColumnsPinned).toHaveBeenCalledTimes(1);
    expect(mockGridApi.setColumnsPinned).toHaveBeenCalledWith([], null);
    expect(mockGridApi.moveColumns).toHaveBeenCalledTimes(1);
  });
});
