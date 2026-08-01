import { render, screen, userEvent } from 'spec/helpers/testing-library';
import DownloadDropdown from './DownloadDropdown';

const onDownloadCSV = jest.fn();
const onDownloadXLSX = jest.fn();

beforeEach(() => {
  onDownloadCSV.mockClear();
  onDownloadXLSX.mockClear();
});

const setup = () =>
  render(
    <DownloadDropdown
      onDownloadCSV={onDownloadCSV}
      onDownloadXLSX={onDownloadXLSX}
    />,
  );

test('renders a download trigger with accessible label', () => {
  setup();
  expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
});

test('fires onDownloadCSV when CSV menu item is selected', async () => {
  setup();
  await userEvent.click(screen.getByRole('button', { name: 'Download' }));
  await userEvent.click(await screen.findByText('Export to CSV'));
  expect(onDownloadCSV).toHaveBeenCalledTimes(1);
  expect(onDownloadXLSX).not.toHaveBeenCalled();
});

test('fires onDownloadXLSX when Excel menu item is selected', async () => {
  setup();
  await userEvent.click(screen.getByRole('button', { name: 'Download' }));
  await userEvent.click(await screen.findByText('Export to Excel'));
  expect(onDownloadXLSX).toHaveBeenCalledTimes(1);
  expect(onDownloadCSV).not.toHaveBeenCalled();
});
