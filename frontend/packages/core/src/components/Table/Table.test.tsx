import { render, screen, waitFor } from '@zobi.dev/core/spec';
import type { ColumnsType } from 'antd/es/table';
import { Table, TableSize } from './index';

interface BasicData {
  columnName: string;
  columnType: string;
  dataType: string;
}

const testData: BasicData[] = [
  {
    columnName: 'Number',
    columnType: 'Numerical',
    dataType: 'number',
  },
  {
    columnName: 'String',
    columnType: 'Physical',
    dataType: 'string',
  },
  {
    columnName: 'Date',
    columnType: 'Virtual',
    dataType: 'date',
  },
];

const testColumns: ColumnsType<BasicData> = [
  {
    title: 'Column Name',
    dataIndex: 'columnName',
    key: 'columnName',
  },
  {
    title: 'Column Type',
    dataIndex: 'columnType',
    key: 'columnType',
  },
  {
    title: 'Data Type',
    dataIndex: 'dataType',
    key: 'dataType',
  },
];

test('renders with default props', async () => {
  render(
    <Table size={TableSize.Middle} columns={testColumns} data={testData} />,
  );
  await waitFor(() =>
    testColumns.forEach(column =>
      expect(
        screen
          .getAllByText(column.title as string)
          .find(el => el.closest('th')),
      ).toBeInTheDocument(),
    ),
  );
  testData.forEach(row => {
    expect(screen.getByText(row.columnName)).toBeInTheDocument();
    expect(screen.getByText(row.columnType)).toBeInTheDocument();
    expect(screen.getByText(row.dataType)).toBeInTheDocument();
  });
});
