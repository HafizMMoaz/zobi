import { render, screen, waitFor } from 'spec/helpers/testing-library';
import Header, { DEFAULT_TITLE } from 'src/features/datasets/AddDataset/Header';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('Header', () => {
  const mockSetDataset = jest.fn();

  const waitForRender = (props?: any) =>
    waitFor(() => render(<Header setDataset={mockSetDataset} {...props} />));

  test('renders a blank state Header', async () => {
    await waitForRender();

    const datasetName = screen.getByText(/new dataset/i);

    expect(datasetName).toBeVisible();
  });

  test('displays "New dataset" when a table is not selected', async () => {
    await waitForRender();

    const datasetName = screen.getByText(/new dataset/i);
    expect(datasetName.innerHTML).toBe(DEFAULT_TITLE);
  });

  test('displays table name when a table is selected', async () => {
    // The schema and table name are passed in through props once selected
    await waitForRender({ schema: 'testSchema', title: 'testTable' });

    const datasetName = screen.getByText(/testtable/i);

    expect(datasetName.innerHTML).toBe('testTable');
  });
});
