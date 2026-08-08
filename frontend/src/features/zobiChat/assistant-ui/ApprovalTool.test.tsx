import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import ApprovalTool from './ApprovalTool';

test('approving calls addResult with approved: true', async () => {
  const addResult = jest.fn();
  render(
    <ApprovalTool
      args={{
        name: 'drop_table',
        title: 'Drop table',
        risk: 'destructive',
        description: 'Deletes a table permanently.',
        arguments: { table: 'orders' },
      }}
      result={undefined}
      addResult={addResult}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Approve' }));
  expect(addResult).toHaveBeenCalledWith({ approved: true });
});

test('declining calls addResult with approved: false', async () => {
  const addResult = jest.fn();
  render(
    <ApprovalTool
      args={{
        name: 'drop_table',
        title: 'Drop table',
        risk: 'destructive',
        description: 'Deletes a table permanently.',
        arguments: { table: 'orders' },
      }}
      result={undefined}
      addResult={addResult}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Decline' }));
  expect(addResult).toHaveBeenCalledWith({ approved: false });
});

test('shows the outcome once a result exists, with no buttons', () => {
  render(
    <ApprovalTool
      args={{
        name: 'drop_table',
        title: 'Drop table',
        risk: 'destructive',
        description: 'Deletes a table permanently.',
        arguments: { table: 'orders' },
      }}
      result={{ approved: true }}
      addResult={jest.fn()}
    />,
  );
  expect(screen.getByText(/approved/i)).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Approve' }),
  ).not.toBeInTheDocument();
});
