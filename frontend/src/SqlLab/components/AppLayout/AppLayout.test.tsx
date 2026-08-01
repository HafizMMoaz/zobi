import React from 'react';
import { render, userEvent, waitFor } from 'spec/helpers/testing-library';
import { initialState } from 'src/SqlLab/fixtures';
import useStoredSidebarWidth from 'src/components/ResizableSidebar/useStoredSidebarWidth';
import { ViewLocations } from 'src/SqlLab/contributions';
import {
  registerTestView,
  cleanupExtensions,
} from 'spec/helpers/extensionTestHelpers';
import AppLayout from './index';

jest.mock('src/components/ResizableSidebar/useStoredSidebarWidth');
jest.mock('src/components/Splitter', () => {
  const Splitter = ({
    onResizeEnd,
    children,
  }: {
    onResizeEnd: (sizes: number[]) => void;
    children: React.ReactNode;
  }) => (
    <div>
      {children}
      <button type="button" onClick={() => onResizeEnd([500])}>
        Resize
      </button>
      <button type="button" onClick={() => onResizeEnd([0])}>
        Resize to zero
      </button>
    </div>
  );
  // eslint-disable-next-line react/display-name
  Splitter.Panel = ({ children }: { children: React.ReactNode }) => (
    <div data-test="mock-panel">{children}</div>
  );
  return { Splitter };
});
jest.mock('@zobi-ui/core/components/Grid', () => ({
  ...jest.requireActual('@zobi-ui/core/components/Grid'),
  useBreakpoint: jest.fn().mockReturnValue(true),
}));

const defaultProps = {
  children: <div>Child</div>,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useStoredSidebarWidth as jest.Mock).mockReturnValue([250, jest.fn()]);
});

afterEach(cleanupExtensions);

test('renders two panels', () => {
  const { getAllByTestId } = render(<AppLayout {...defaultProps} />, {
    useRedux: true,
    initialState,
  });
  expect(getAllByTestId('mock-panel')).toHaveLength(2);
});

test('renders children', () => {
  const { getByText } = render(<AppLayout {...defaultProps} />, {
    useRedux: true,
    initialState,
  });
  expect(getByText('Child')).toBeInTheDocument();
});

test('calls setWidth on sidebar resize when not hidden', async () => {
  const setWidth = jest.fn();
  (useStoredSidebarWidth as jest.Mock).mockReturnValue([250, setWidth]);
  const { getByRole } = render(<AppLayout {...defaultProps} />, {
    useRedux: true,
    initialState,
  });

  // toggle sidebar to show
  await userEvent.click(getByRole('button', { name: 'Resize' }));
  // set different width
  await userEvent.click(getByRole('button', { name: 'Resize' }));
  await waitFor(() => expect(setWidth).toHaveBeenCalled());
});

test('right sidebar is hidden when no extensions registered', () => {
  const { queryByText } = render(<AppLayout {...defaultProps} />, {
    useRedux: true,
    initialState,
  });
  // No right sidebar content — the third Splitter.Panel is conditionally omitted
  expect(queryByText('Right Sidebar Content')).not.toBeInTheDocument();
});

test('renders right sidebar when view is contributed at rightSidebar location', () => {
  registerTestView(
    ViewLocations.sqllab.rightSidebar,
    'test-right-sidebar-view',
    'Test Right Sidebar View',
    () => React.createElement('div', null, 'Right Sidebar Content'),
  );

  const { getByText, getAllByTestId } = render(
    <AppLayout {...defaultProps} />,
    {
      useRedux: true,
      initialState,
    },
  );

  expect(getByText('Child')).toBeInTheDocument();
  expect(getByText('Right Sidebar Content')).toBeInTheDocument();
  expect(getAllByTestId('mock-panel')).toHaveLength(3);
});
