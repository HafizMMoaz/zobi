import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { ExportToCSVDropdown } from './index';

const exportCSVOriginal = jest.fn();
const exportCSVPivoted = jest.fn();

const setup = () =>
  render(
    <ExportToCSVDropdown
      exportCSVOriginal={exportCSVOriginal}
      exportCSVPivoted={exportCSVPivoted}
    >
      <div>.CSV</div>
    </ExportToCSVDropdown>,
  );

test('Dropdown button with menu renders', () => {
  setup();

  expect(screen.getByText('.CSV')).toBeVisible();

  userEvent.click(screen.getByText('.CSV'));
  expect(screen.getByRole('menu')).toBeInTheDocument();
  expect(screen.getByText('Original')).toBeInTheDocument();
  expect(screen.getByText('Pivoted')).toBeInTheDocument();
});

test('Call export csv original on click', () => {
  setup();

  userEvent.click(screen.getByText('.CSV'));
  userEvent.click(screen.getByText('Original'));

  expect(exportCSVOriginal).toHaveBeenCalled();
});

test('Call export csv pivoted on click', () => {
  setup();

  userEvent.click(screen.getByText('.CSV'));
  userEvent.click(screen.getByText('Pivoted'));

  expect(exportCSVPivoted).toHaveBeenCalled();
});
