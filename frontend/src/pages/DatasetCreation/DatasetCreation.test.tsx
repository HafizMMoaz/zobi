import { render, screen } from 'spec/helpers/testing-library';
import AddDataset from 'src/pages/DatasetCreation';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
  useParams: () => ({ datasetId: undefined }),
}));

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('AddDataset', () => {
  test('renders a blank state AddDataset', async () => {
    render(<AddDataset />, { useRedux: true, useRouter: true });

    const blankeStateImgs = screen.getAllByRole('img', { name: /empty/i });

    // Header
    expect(await screen.findByText(/new dataset/i)).toBeVisible();
    // Left panel
    expect(blankeStateImgs[0]).toBeVisible();
    // Footer
    expect(screen.getByText(/Cancel/i)).toBeVisible();

    expect(blankeStateImgs.length).toBe(1);
  });
});
