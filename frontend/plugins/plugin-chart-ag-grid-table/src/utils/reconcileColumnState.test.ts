import {
  type ColDef,
  type ColumnState,
} from '@zobi-ui/core/components/ThemedAgGridReact';
import reconcileColumnState, { getLeafColumnIds } from './reconcileColumnState';

test('getLeafColumnIds flattens grouped column defs in visual order', () => {
  const colDefs: ColDef[] = [
    { field: 'Manufacture_Date' },
    {
      headerName: 'Metrics',
      children: [
        { field: 'SUM(Sales_Amount)' },
        { field: 'SUM(Discount_Applied)' },
      ],
    } as ColDef,
    { field: 'SUM(Quantity_Sold)' },
  ];

  expect(getLeafColumnIds(colDefs)).toEqual([
    'Manufacture_Date',
    'SUM(Sales_Amount)',
    'SUM(Discount_Applied)',
    'SUM(Quantity_Sold)',
  ]);
});

test('preserves saved order when the current column set is unchanged', () => {
  const colDefs: ColDef[] = [
    { field: 'Transaction_Timestamp' },
    { field: 'SUM(Sales_Amount)' },
    { field: 'SUM(Discount_Applied)' },
  ];
  const savedColumnState: ColumnState[] = [
    { colId: 'SUM(Sales_Amount)' },
    { colId: 'Transaction_Timestamp' },
    { colId: 'SUM(Discount_Applied)' },
  ];

  expect(reconcileColumnState(savedColumnState, colDefs)).toEqual({
    applyOrder: true,
    columnState: savedColumnState,
  });
});

test('drops stale order when a dynamic group by swaps the dimension column', () => {
  const currentColDefs: ColDef[] = [
    { field: 'Manufacture_Date' },
    { field: 'SUM(Sales_Amount)' },
    { field: 'SUM(Discount_Applied)' },
    { field: 'SUM(Quantity_Sold)' },
  ];
  const savedColumnState: ColumnState[] = [
    { colId: 'Transaction_Timestamp' },
    { colId: 'SUM(Sales_Amount)' },
    { colId: 'SUM(Discount_Applied)' },
    { colId: 'SUM(Quantity_Sold)' },
  ];

  expect(reconcileColumnState(savedColumnState, currentColDefs)).toEqual({
    applyOrder: false,
    columnState: [
      { colId: 'SUM(Sales_Amount)' },
      { colId: 'SUM(Discount_Applied)' },
      { colId: 'SUM(Quantity_Sold)' },
    ],
  });
});
