import { render, screen, userEvent } from 'spec/helpers/testing-library';

import RowCountLabel from '.';

test('RowCountLabel renders singular result', () => {
  render(<RowCountLabel rowcount={1} limit={100} />);
  const expectedText = '1 row';
  expect(screen.getByText(expectedText)).toBeInTheDocument();
  userEvent.hover(screen.getByText(expectedText));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('RowCountLabel renders plural result', () => {
  render(<RowCountLabel rowcount={2} limit={100} />);
  const expectedText = '2 rows';
  expect(screen.getByText(expectedText)).toBeInTheDocument();
  userEvent.hover(screen.getByText(expectedText));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('RowCountLabel renders formatted result', () => {
  render(<RowCountLabel rowcount={1000} limit={10000} />);
  const expectedText = '1k rows';
  expect(screen.getByText(expectedText)).toBeInTheDocument();
  userEvent.hover(screen.getByText(expectedText));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('RowCountLabel renders limit with danger and tooltip', async () => {
  render(<RowCountLabel rowcount={100} limit={100} />);
  const expectedText = '100 rows';
  expect(screen.getByText(expectedText)).toBeInTheDocument();
  userEvent.hover(screen.getByText(expectedText));
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent('The row limit');
});

test('RowCountLabel renders loading', () => {
  render(<RowCountLabel loading />);
  const expectedText = 'Loading...';
  expect(screen.getByText(expectedText)).toBeInTheDocument();
  userEvent.hover(screen.getByText(expectedText));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});
