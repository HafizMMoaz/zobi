import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';

import { ModifiedInfo } from '.';

const TEST_DATE = '2023-11-20';
const USER = {
  id: 1,
  first_name: 'Foo',
  last_name: 'Bar',
};

test('should render a tooltip when user is provided', async () => {
  render(<ModifiedInfo user={USER} date={TEST_DATE} />);

  const dateElement = screen.getByTestId('audit-info-date');
  expect(dateElement).toBeInTheDocument();
  expect(screen.getByText(TEST_DATE)).toBeInTheDocument();
  expect(screen.queryByText('Modified by: Foo Bar')).not.toBeInTheDocument();
  await userEvent.hover(dateElement);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(screen.getByText('Modified by: Foo Bar')).toBeInTheDocument();
});

test('should render only the date if username is not provided', async () => {
  render(<ModifiedInfo date={TEST_DATE} />);

  const dateElement = screen.getByTestId('audit-info-date');
  expect(dateElement).toBeInTheDocument();
  expect(screen.getByText(TEST_DATE)).toBeInTheDocument();
  await userEvent.hover(dateElement);
  await waitFor(
    () => {
      const tooltip = screen.queryByRole('tooltip');
      expect(tooltip).not.toBeInTheDocument();
    },
    { timeout: 1000 },
  );
});
