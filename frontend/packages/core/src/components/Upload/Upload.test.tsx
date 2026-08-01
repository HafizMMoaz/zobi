import { render, screen, fireEvent, waitFor } from '@zobi.dev/core/spec';
import { Button, Upload } from '..';

describe('Upload Component', () => {
  test('renders upload button and triggers file upload', async () => {
    const handleChange = jest.fn();

    render(
      <Upload onChange={handleChange}>
        <Button>Click to Upload</Button>
      </Upload>,
    );

    const btn = screen.getByRole('button', { name: /click to upload/i });
    expect(btn).toBeInTheDocument();

    const fileInput = btn.closest('span')?.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();

    const file = new File(['dummy content'], 'example.png', {
      type: 'image/png',
    });
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });
});
