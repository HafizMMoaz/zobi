import type { FilterableTableProps } from './types';
import { FilterableTable } from '.';

export default {
  title: 'Components/FilterableTable',
  component: FilterableTable,
};

export const InteractiveTable = (args: FilterableTableProps) => (
  <div css={{ maxWidth: 700 }}>
    <FilterableTable {...args} />
  </div>
);

InteractiveTable.args = {
  filterText: '',
  orderedColumnKeys: ['id', 'name', 'age', 'location'],
  data: [
    {
      id: 1,
      name: 'John',
      age: 32,
      location: { city: 'Barcelona', country: 'Spain' },
    },
    {
      id: 2,
      name: 'Mary',
      age: 53,
      location: { city: 'Madrid', country: 'Spain' },
    },
    {
      id: 3,
      name: 'Peter',
      age: 60,
      location: { city: 'Paris', country: 'France' },
    },
  ],
  height: 300,
  headerHeight: 30,
  overscanColumnCount: 0,
  overscanRowCount: 0,
  rowHeight: 30,
  striped: true,
  expandedColumns: [],
};

InteractiveTable.argTypes = {};
