import { CSSProperties, ReactNode } from 'react';
import { Table, type TableColumnsType } from 'antd';

interface TooltipRowData {
  key: string | number;
  keyColumn?: ReactNode;
  keyStyle?: CSSProperties;
  valueColumn: ReactNode;
  valueStyle?: CSSProperties;
}

interface TooltipTableProps {
  className?: string;
  data: TooltipRowData[];
}

const VALUE_CELL_STYLE: CSSProperties = { paddingLeft: 8, textAlign: 'right' };

const TooltipTable = ({ className = '', data }: TooltipTableProps) => {
  const columns: TableColumnsType<TooltipRowData> = [
    {
      title: '',
      dataIndex: 'keyColumn',
      key: 'keyColumn',
      render: (text, record) => (
        <div style={record.keyStyle}>{record.keyColumn ?? record.key}</div>
      ),
    },
    {
      title: '',
      dataIndex: 'valueColumn',
      key: 'valueColumn',
      align: 'right',
      render: (text, record) => (
        <div
          style={
            record.valueStyle
              ? { ...VALUE_CELL_STYLE, ...record.valueStyle }
              : VALUE_CELL_STYLE
          }
        >
          {record.valueColumn}
        </div>
      ),
    },
  ];

  return (
    <Table
      className={className}
      columns={columns}
      dataSource={data}
      pagination={false}
      showHeader={false}
      bordered={false}
    />
  );
};

export default TooltipTable;
