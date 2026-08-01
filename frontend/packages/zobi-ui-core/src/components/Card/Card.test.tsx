import { render, waitFor } from '@zobi-ui/core/spec';
import { Card } from '.';

afterEach(async () => {
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

test('should render', async () => {
  const { container } = render(<Card />);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});
