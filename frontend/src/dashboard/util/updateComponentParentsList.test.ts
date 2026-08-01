import updateComponentParentsList from 'src/dashboard/util/updateComponentParentsList';
import { DASHBOARD_ROOT_ID } from 'src/dashboard/util/constants';
import {
  dashboardLayout,
  dashboardLayoutWithTabs,
} from 'spec/fixtures/mockDashboardLayout';

type LayoutComponent = {
  id: string;
  parents?: string[];
  children?: string[];
  [key: string]: unknown;
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('updateComponentParentsList', () => {
  const emptyLayout: Record<string, LayoutComponent> = {
    GRID_ID: {
      children: [],
      id: 'GRID_ID',
      type: 'GRID',
    },
    ROOT_ID: {
      children: ['GRID_ID'],
      id: 'ROOT_ID',
      type: 'ROOT',
    },
  };
  const gridLayout = {
    ...dashboardLayout.present,
  } as Record<string, LayoutComponent>;
  const tabsLayout = {
    ...dashboardLayoutWithTabs.present,
  } as Record<string, LayoutComponent>;

  test('should handle empty layout', () => {
    const nextState = {
      ...emptyLayout,
    };

    updateComponentParentsList({
      currentComponent: nextState[DASHBOARD_ROOT_ID],
      layout: nextState,
    });

    expect(nextState.GRID_ID.parents).toEqual(['ROOT_ID']);
  });

  test('should handle grid layout', () => {
    const nextState = {
      ...gridLayout,
    };

    updateComponentParentsList({
      currentComponent: nextState[DASHBOARD_ROOT_ID],
      layout: nextState,
    });

    expect(nextState.GRID_ID.parents).toEqual(['ROOT_ID']);
    expect(nextState.CHART_ID.parents).toEqual([
      'ROOT_ID',
      'GRID_ID',
      'ROW_ID',
      'COLUMN_ID',
    ]);
  });

  test('should handle root level tabs', () => {
    const nextState = {
      ...tabsLayout,
    };

    updateComponentParentsList({
      currentComponent: nextState[DASHBOARD_ROOT_ID],
      layout: nextState,
    });

    expect(nextState.GRID_ID.parents).toEqual(['ROOT_ID']);
    expect(nextState.CHART_ID2.parents).toEqual([
      'ROOT_ID',
      'TABS_ID',
      'TAB_ID2',
      'ROW_ID2',
    ]);
  });
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('updateComponentParentsList with bad inputs', () => {
  test('should handle invalid parameters and not throw error', () => {
    updateComponentParentsList({
      currentComponent: undefined,
      layout: undefined,
    });

    expect(() =>
      updateComponentParentsList({
        currentComponent: undefined,
        layout: undefined,
      }),
    ).not.toThrow();

    expect(() =>
      updateComponentParentsList({
        currentComponent: { id: '' },
        layout: undefined,
      }),
    ).not.toThrow();

    /**
     * the assignment of layout = {} only works for undefined, not null
     * This was a missed case in the function previously.
     * This test ensure the null check is not removed
     */
    expect(() =>
      updateComponentParentsList({
        currentComponent: { id: '' },
        layout: null as any,
      }),
    ).not.toThrow();

    /**
     * This test catches an edge case that caused runtime error in production system where
     * a simple logic flaw performed a dot notation lookup on an undefined object
     */
    expect(() =>
      updateComponentParentsList({
        currentComponent: { id: 'id3', children: ['id1', 'id2'] },
        layout: { id3: { id: 'id3' } },
      }),
    ).not.toThrow();

    /**
     * This test catches an edge case that causes runtime error where
     * a simple logic flaw performed currentComponent.children.forEach without
     * verifying currentComponent.children is an Array with a .forEach function defined
     */
    expect(() =>
      updateComponentParentsList({
        currentComponent: { id: 'id3' },
        layout: { id3: { id: 'id3' } },
      }),
    ).not.toThrow();

    expect(() =>
      updateComponentParentsList({
        currentComponent: { id: 'id3' },
        layout: {},
      }),
    ).not.toThrow();
  });
});
