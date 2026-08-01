import fetchMock from 'fetch-mock';
import { render, screen } from 'spec/helpers/testing-library';
import EditDataset from './index';

const DATASET_ENDPOINT = 'glob:*api/v1/dataset/1/related_objects';

const mockedProps = {
  id: '1',
};

fetchMock.get(DATASET_ENDPOINT, { charts: { results: [], count: 2 } });

test('should render edit dataset view with tabs', async () => {
  render(<EditDataset {...mockedProps} />);

  const columnTab = await screen.findByRole('tab', { name: /columns/i });
  const metricsTab = screen.getByRole('tab', { name: /metrics/i });
  const usageTab = screen.getByRole('tab', { name: /usage/i });

  expect(fetchMock.callHistory.calls(DATASET_ENDPOINT)).toBeTruthy();
  expect(columnTab).toBeInTheDocument();
  expect(metricsTab).toBeInTheDocument();
  expect(usageTab).toBeInTheDocument();
});
