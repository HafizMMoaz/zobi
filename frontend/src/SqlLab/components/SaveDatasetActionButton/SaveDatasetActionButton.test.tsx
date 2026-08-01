import { render, screen } from 'spec/helpers/testing-library';
import SaveDatasetActionButton from 'src/SqlLab/components/SaveDatasetActionButton';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('SaveDatasetActionButton', () => {
  test('renders a split save button', async () => {
    const onSaveAsExplore = jest.fn();
    render(
      <SaveDatasetActionButton
        setShowSave={() => true}
        onSaveAsExplore={onSaveAsExplore}
      />,
    );

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    const saveDatasetBtn = screen.getByRole('button', {
      name: /save dataset/i,
    });

    expect(
      await screen.findByRole('button', { name: 'Save' }),
    ).toBeInTheDocument();
    expect(saveBtn).toBeVisible();
    expect(saveDatasetBtn).toBeVisible();
  });
});
