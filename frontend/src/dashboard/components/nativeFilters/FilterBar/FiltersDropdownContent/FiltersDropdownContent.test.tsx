import { render, screen } from 'spec/helpers/testing-library';
import { Filter } from '@zobi-ui/core';
import { FiltersDropdownContent } from '.';

const buildFilter = (id: string, name: string): Filter =>
  ({
    id,
    name,
    filterType: 'filter_select',
    targets: [{ datasetId: 1, column: { name: 'country' } }],
    defaultDataMask: {},
    controlValues: {},
    cascadeParentIds: [],
    scope: { rootPath: ['ROOT_ID'], excluded: [] as string[] },
  }) as unknown as Filter;

const baseProps = {
  overflowedCrossFilters: [],
  filtersInScope: [buildFilter('filter-1', 'In Scope Filter')],
  renderer: (filter: any) => <div key={filter.id}>{filter.name}</div>,
  rendererCrossFilter: () => null,
  showCollapsePanel: true,
  forceRenderOutOfScope: false,
};

test('does not render "Filters out of scope" section when filtersOutOfScope is empty', () => {
  render(<FiltersDropdownContent {...baseProps} filtersOutOfScope={[]} />);

  expect(screen.queryByText(/Filters out of scope/)).not.toBeInTheDocument();
});

test('renders "Filters out of scope" section when one or more filters are out of scope', () => {
  render(
    <FiltersDropdownContent
      {...baseProps}
      filtersOutOfScope={[buildFilter('filter-2', 'Out of Scope Filter')]}
    />,
  );

  expect(screen.getByText(/Filters out of scope/)).toBeInTheDocument();
});

test('does not render "Filters out of scope" section when showCollapsePanel is false', () => {
  render(
    <FiltersDropdownContent
      {...baseProps}
      showCollapsePanel={false}
      filtersOutOfScope={[buildFilter('filter-2', 'Out of Scope Filter')]}
    />,
  );

  expect(screen.queryByText(/Filters out of scope/)).not.toBeInTheDocument();
});
