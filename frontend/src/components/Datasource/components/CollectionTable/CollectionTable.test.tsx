import { render } from 'spec/helpers/testing-library';

import mockDatasource from 'spec/fixtures/mockDatasource';
import CollectionTable from '.';

const props = {
  collection: mockDatasource['7__table'].columns,
  tableColumns: ['column_name', 'type', 'groupby'],
  sortColumns: [],
};

test('renders a table', () => {
  const { container } = render(<CollectionTable {...props} />);
  const tableBody = container.querySelector('.ant-table-tbody');
  expect(tableBody).toBeInTheDocument();
  const rows = tableBody?.getElementsByTagName('tr');
  expect(rows).toHaveLength(mockDatasource['7__table'].columns.length + 1);
});
