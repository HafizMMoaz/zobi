import { useRef, useState } from 'react';
import { FeatureFlag, VizType } from '@zobi-ui/core';
import { render, screen, waitFor } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import mockState from 'spec/fixtures/mockState';
import { sliceId } from 'spec/fixtures/mockChartQueries';
import { cachedZobiGet } from 'src/utils/cachedZobiGet';
import ChartContextMenu, {
  ChartContextMenuRef,
  ContextMenuItem,
} from './ChartContextMenu';

jest.mock('src/utils/cachedZobiGet');

const mockCachedZobiGet = cachedZobiGet as jest.MockedFunction<
  typeof cachedZobiGet
>;

const defaultFormData = {
  datasource: '1__table',
  viz_type: VizType.Pie,
};

const TestWrapper = () => {
  const contextMenuRef = useRef<ChartContextMenuRef>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);

  const handleClose = () => {
    setIsTooltipVisible(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => contextMenuRef.current?.open(100, 100, {})}
        data-test="open-context-menu"
      >
        Open Context Menu
      </button>
      {isTooltipVisible && (
        <div data-test="tooltip-visible">Tooltip is visible</div>
      )}
      <ChartContextMenu
        ref={contextMenuRef}
        id={sliceId}
        formData={defaultFormData}
        onSelection={jest.fn()}
        onClose={handleClose}
        displayedItems={ContextMenuItem.All}
      />
    </>
  );
};

const setup = () =>
  render(<TestWrapper />, {
    useRedux: true,
    initialState: {
      ...mockState,
      user: {
        ...mockState.user,
        roles: {
          Admin: [
            ['can_explore', 'Zobi'],
            ['can_samples', 'Datasource'],
            ['can_write', 'ExploreFormDataRestApi'],
            ['can_get_drill_info', 'Dataset'],
          ],
        },
      },
    },
  });

beforeEach(() => {
  // @ts-ignore
  global.featureFlags = {
    [FeatureFlag.DrillToDetail]: true,
    [FeatureFlag.DrillBy]: true,
  };

  mockCachedZobiGet.mockClear();
  mockCachedZobiGet.mockResolvedValue({
    response: {} as Response,
    json: {
      result: {
        columns: [],
        metrics: [],
      },
    },
  });
});

afterEach(() => {
  // @ts-ignore
  delete global.featureFlags;
});

test('tooltip is restored when user clicks outside to close context menu', async () => {
  setup();

  const openButton = screen.getByTestId('open-context-menu');
  userEvent.click(openButton);

  await waitFor(() => {
    expect(screen.getByTestId('chart-context-menu')).toBeInTheDocument();
  });

  expect(screen.getByTestId('tooltip-visible')).toBeInTheDocument();

  userEvent.click(document.body);

  await waitFor(() => {
    expect(screen.getByTestId('tooltip-visible')).toBeInTheDocument();
  });
});

test('tooltip is restored when user selects a menu item', async () => {
  setup();

  const openButton = screen.getByTestId('open-context-menu');
  userEvent.click(openButton);

  await waitFor(() => {
    expect(screen.getByTestId('chart-context-menu')).toBeInTheDocument();
  });

  const menuItem = screen.getByText('Drill to detail');
  userEvent.click(menuItem);

  await waitFor(() => {
    expect(screen.getByTestId('tooltip-visible')).toBeInTheDocument();
  });
});
