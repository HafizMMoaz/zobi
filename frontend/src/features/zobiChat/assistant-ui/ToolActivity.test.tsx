import { render, screen } from 'spec/helpers/testing-library';
import ToolActivity from './ToolActivity';

test('shows a running indicator with no result', () => {
  render(<ToolActivity toolName="list_tables" args={{}} />);
  expect(screen.getByText('list_tables')).toBeInTheDocument();
  expect(screen.getByText(/running/i)).toBeInTheDocument();
});

test('shows the output once a result arrives', () => {
  render(
    <ToolActivity
      toolName="list_tables"
      args={{}}
      result={{ ok: true, output: 'orders, users' }}
    />,
  );
  expect(screen.getByText('orders, users')).toBeInTheDocument();
});

test('flags a failed result', () => {
  render(
    <ToolActivity
      toolName="drop_table"
      args={{ table: 'orders' }}
      result={{ ok: false, output: 'permission denied' }}
    />,
  );
  expect(screen.getByText(/failed/i)).toBeInTheDocument();
});
