import { render, screen } from 'spec/helpers/testing-library';
import RightPanel from 'src/features/datasets/AddDataset/RightPanel';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('RightPanel', () => {
  test('renders a blank state RightPanel', () => {
    render(<RightPanel />);

    expect(screen.getByText(/right panel/i)).toBeVisible();
  });
});
