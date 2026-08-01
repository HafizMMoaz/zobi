import { ReactNode } from 'react';
import { render, screen } from 'spec/helpers/testing-library';
import {
  ChartCustomization,
  ChartCustomizationType,
  Filter,
  NativeFilterType,
} from '@zobi.dev/core';
import { ChartCustomizationPlugins } from 'src/constants';
import FilterControl from './FilterControl';

jest.mock('src/dashboard/components/nativeFilters/state', () => ({
  useIsFilterInScope: () => () => false,
}));

jest.mock('../Vertical', () => {
  const { createContext } = require('react');
  return {
    FilterBarScrollContext: createContext(false),
  };
});

jest.mock('./FilterValue', () => () => null);

jest.mock('../../FilterCard', () => ({
  FilterCard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('./GroupByFilterCard', () => () => null);

jest.mock('../utils', () => ({
  checkIsMissingRequiredValue: () => false,
}));

jest.mock('react-reverse-portal', () => ({
  createHtmlPortalNode: () => ({}),
  InPortal: ({ children }: { children: ReactNode }) => <>{children}</>,
  OutPortal: () => null,
}));

const deckglFilter: ChartCustomization = {
  id: 'filter1',
  name: 'Layer Visibility',
  filterType: ChartCustomizationPlugins.DeckglLayerVisibility,
  type: ChartCustomizationType.ChartCustomization,
  targets: [],
  scope: { rootPath: [], excluded: [] },
  controlValues: {},
  defaultDataMask: {},
};

const nativeFilter: Filter = {
  id: 'filter2',
  name: 'Select Filter',
  filterType: 'filter_select',
  type: NativeFilterType.NativeFilter,
  targets: [],
  scope: { rootPath: [], excluded: [] },
  controlValues: {},
  defaultDataMask: {},
  cascadeParentIds: [],
  description: '',
};

test('renders DeckglLayerVisibilityTooltip for deckgl layer visibility filter type', () => {
  render(
    <FilterControl filter={deckglFilter} onFilterSelectionChange={jest.fn()} />,
  );
  expect(
    screen.getByTestId('deckgl-layer-visibility-tooltip-icon'),
  ).toBeInTheDocument();
});

test('does not render DeckglLayerVisibilityTooltip for standard filter type', () => {
  render(
    <FilterControl filter={nativeFilter} onFilterSelectionChange={jest.fn()} />,
  );
  expect(
    screen.queryByTestId('deckgl-layer-visibility-tooltip-icon'),
  ).not.toBeInTheDocument();
});
