import { isValidElement } from 'react';

import HighlightedSql from 'src/SqlLab/components/HighlightedSql';
import { fireEvent, render } from 'spec/helpers/testing-library';

const sql =
  "SELECT * FROM test WHERE something='fkldasjfklajdslfkjadlskfjkldasjfkladsjfkdjsa'";
test('renders HighlightedSql component with sql prop', () => {
  expect(isValidElement(<HighlightedSql sql={sql} />)).toBe(true);
});
test('renders a ModalTrigger component', () => {
  const { getByTestId } = render(<HighlightedSql sql={sql} />);
  expect(getByTestId('span-modal-trigger')).toBeInTheDocument();
});
test('renders a ModalTrigger component with shrink prop and maxWidth prop set to 20', () => {
  const { getByTestId } = render(
    <HighlightedSql sql={sql} shrink maxWidth={20} />,
  );
  expect(getByTestId('span-modal-trigger')).toBeInTheDocument();
});
test('renders single SQL block with no tabs when rawSql equals sql', () => {
  const { queryByRole, getByTestId, queryByText } = render(
    <HighlightedSql sql={sql} rawSql={sql} shrink maxWidth={5} />,
  );
  expect(queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(getByTestId('span-modal-trigger'));
  expect(queryByRole('dialog')).toBeInTheDocument();
  expect(queryByText('Executed SQL')).not.toBeInTheDocument();
  expect(queryByText('Source SQL')).toBeInTheDocument();
});

test('renders tabs when rawSql differs from sql', () => {
  const { queryByRole, getByTestId, getByText } = render(
    <HighlightedSql sql={sql} rawSql="SELECT * FROM foo" shrink maxWidth={5} />,
  );
  expect(queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(getByTestId('span-modal-trigger'));
  expect(queryByRole('dialog')).toBeInTheDocument();
  expect(getByText('Executed SQL')).toBeInTheDocument();
  expect(getByText('Source SQL')).toBeInTheDocument();
});

test('renders tabs when rawSql has an added LIMIT', () => {
  const { queryByRole, getByTestId, getByText } = render(
    <HighlightedSql
      sql={sql}
      rawSql={`${sql} LIMIT 1000`}
      shrink
      maxWidth={5}
    />,
  );
  expect(queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(getByTestId('span-modal-trigger'));
  expect(queryByRole('dialog')).toBeInTheDocument();
  expect(getByText('Executed SQL')).toBeInTheDocument();
  expect(getByText('Source SQL')).toBeInTheDocument();
});
