import { TimeFormats } from '@zobi-ui/core';
import { render, screen } from '@zobi-ui/core/spec';
import TimeCell from '.';

const DATE = Date.parse('2022-01-01');

test('renders with default format', async () => {
  render(<TimeCell value={DATE} />);
  expect(screen.getByText('2022-01-01 00:00:00')).toBeInTheDocument();
});

test('renders with custom format', async () => {
  render(<TimeCell value={DATE} format={TimeFormats.DATABASE_DATE} />);
  expect(screen.getByText('2022-01-01')).toBeInTheDocument();
});

test('renders with number', async () => {
  render(<TimeCell value={DATE.valueOf()} />);
  expect(screen.getByText('2022-01-01 00:00:00')).toBeInTheDocument();
});

test('renders with no value', async () => {
  render(<TimeCell />);
  expect(screen.getByText('N/A')).toBeInTheDocument();
});

test('renders with invalid date format', async () => {
  render(<TimeCell format="aaa-bbb-ccc" value={DATE} />);
  expect(screen.getByText('aaa-bbb-ccc')).toBeInTheDocument();
});
