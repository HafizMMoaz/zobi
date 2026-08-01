

import '@testing-library/jest-dom';
import { screen, render, within } from '@testing-library/react';
import { TooltipTable } from '@zobi-ui/core';
import { CSSProperties } from 'react';

describe('TooltipTable', () => {
  test('sets className', () => {
    const { container } = render(
      <TooltipTable className="test-class" data={[]} />,
    );
    expect(container.querySelector('.test-class')).toBeInTheDocument();
  });

  test('renders empty table', () => {
    render(<TooltipTable data={[]} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    const rows = within(table).queryAllByRole('row');
    expect(rows.length).toBe(1);
    expect(rows[0]).toHaveTextContent(/No Data|empty/i);
  });

  test('renders table with content', async () => {
    const data = [
      {
        key: 'Cersei',
        keyColumn: 'Cersei',
        keyStyle: { padding: '10' },
        valueColumn: 2,
        valueStyle: { textAlign: 'right' as CSSProperties['textAlign'] },
      },
      {
        key: 'Jaime',
        keyColumn: 'Jaime',
        keyStyle: { padding: '10' },
        valueColumn: 1,
        valueStyle: { textAlign: 'right' as CSSProperties['textAlign'] },
      },
      { key: 'Tyrion', keyStyle: { padding: '10' }, valueColumn: 2 },
    ];

    render(<TooltipTable data={data} />);

    await Promise.all(
      data.map(async ({ keyColumn, key, valueColumn }) => {
        const keyText = keyColumn ?? key;
        const keyCell = await screen.findByText(keyText);
        expect(keyCell).toBeInTheDocument();

        const row = keyCell.closest('tr');
        expect(row).toBeInTheDocument();

        const cells = within(row!).getAllByRole('cell');
        expect(cells[0]).toHaveTextContent(String(keyText));
        expect(cells[1]).toHaveTextContent(String(valueColumn));
      }),
    );
  });
});
