import {
  render,
  screen,
  userEvent,
  within,
} from 'spec/helpers/testing-library';
import { CHART_TYPE } from 'src/dashboard/util/componentTypes';
import {
  ChartsScopingListPanel,
  ChartsScopingListPanelProps,
} from './ChartsScopingListPanel';

const DEFAULT_PROPS: ChartsScopingListPanelProps = {
  addNewCustomScope: jest.fn(),
  removeCustomScope: jest.fn(),
  setCurrentChartId: jest.fn(),
  activeChartId: undefined,
  chartConfigs: {
    1: {
      id: 1,
      crossFilters: {
        scope: 'global' as const,
        chartsInScope: [2, 3, 4],
      },
    },
    2: {
      id: 2,
      crossFilters: {
        scope: 'global' as const,
        chartsInScope: [1, 3, 4],
      },
    },
    3: {
      id: 3,
      crossFilters: {
        scope: {
          rootPath: ['ROOT_ID'],
          excluded: [1, 3],
        },
        chartsInScope: [2, 4],
      },
    },
    4: {
      id: 4,
      crossFilters: {
        scope: {
          rootPath: ['ROOT_ID'],
          excluded: [1, 4],
        },
        chartsInScope: [2, 3],
      },
    },
  },
};

const INITIAL_STATE = {
  dashboardLayout: {
    past: [],
    future: [],
    present: {
      CHART_1: {
        id: 'CHART_1',
        type: CHART_TYPE,
        meta: {
          chartId: 1,
          sliceName: 'chart 1',
        },
      },
      CHART_2: {
        id: 'CHART_2',
        type: CHART_TYPE,
        meta: {
          chartId: 2,
          sliceName: 'chart 2',
        },
      },
      CHART_3: {
        id: 'CHART_3',
        type: CHART_TYPE,
        meta: {
          chartId: 3,
          sliceName: 'chart 3',
          sliceNameOverride: 'Chart 3',
        },
      },
      CHART_4: {
        id: 'CHART_4',
        type: CHART_TYPE,
        meta: {
          chartId: 4,
          sliceName: 'chart 4',
        },
      },
    },
  },
};

const setup = (props = DEFAULT_PROPS) =>
  render(<ChartsScopingListPanel {...props} />, {
    useRedux: true,
    initialState: INITIAL_STATE,
  });

test('Renders charts scoping list panel', () => {
  setup();
  expect(screen.getByText('Add custom scoping')).toBeVisible();
  expect(screen.getByText('All charts/global scoping')).toBeVisible();
  expect(screen.getByText('All charts/global scoping')).toHaveClass('active');
  expect(screen.queryByText('chart 1')).not.toBeInTheDocument();
  expect(screen.queryByText('chart 2')).not.toBeInTheDocument();
  expect(screen.getByText('Chart 3')).toBeVisible();
  expect(screen.getByText('chart 4')).toBeVisible();
  expect(screen.queryByText('[new custom scoping]')).not.toBeInTheDocument();
});

test('Renders custom scoping item', () => {
  setup({
    ...DEFAULT_PROPS,
    activeChartId: -1,
    chartConfigs: {
      ...DEFAULT_PROPS.chartConfigs,
      [-1]: {
        id: -1,
        crossFilters: {
          scope: 'global',
          chartsInScope: [1, 2, 3, 4],
        },
      },
    },
  });
  expect(screen.getByText('All charts/global scoping')).toBeVisible();
  expect(screen.getByText('All charts/global scoping')).not.toHaveClass(
    'active',
  );
  expect(screen.queryByText('chart 1')).not.toBeInTheDocument();
  expect(screen.queryByText('chart 2')).not.toBeInTheDocument();
  expect(screen.getByText('Chart 3')).toBeVisible();
  expect(screen.getByText('chart 4')).toBeVisible();
  expect(screen.getByText('[new custom scoping]')).toBeVisible();
  expect(screen.getByText('[new custom scoping]')).toHaveClass('active');
});

test('Uses callbacks on click', () => {
  setup();

  userEvent.click(screen.getByText('Add custom scoping'));
  expect(DEFAULT_PROPS.addNewCustomScope).toHaveBeenCalled();

  userEvent.click(screen.getByText('All charts/global scoping'));
  expect(DEFAULT_PROPS.setCurrentChartId).toHaveBeenCalledWith(undefined);

  userEvent.click(screen.getByText('Chart 3'));
  expect(DEFAULT_PROPS.setCurrentChartId).toHaveBeenCalledWith(3);

  const chart4Container = screen.getByText('chart 4').closest('div');
  if (chart4Container) {
    userEvent.click(within(chart4Container).getByLabelText('delete'));
  }
  expect(DEFAULT_PROPS.removeCustomScope).toHaveBeenCalledWith(4);
});

test('Renders charts scoping list panel with FilterTitle rendered with role="button"', () => {
  setup();
  expect(screen.getByText('All charts/global scoping')).toBeVisible();
  expect(screen.getByText('All charts/global scoping')).toHaveAttribute(
    'role',
    'button',
  );
});
