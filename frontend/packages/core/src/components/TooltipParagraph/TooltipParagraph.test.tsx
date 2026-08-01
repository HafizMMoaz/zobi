import { render, screen, userEvent, waitFor } from '@zobi.dev/core/spec';
import TooltipParagraph from '.';

test('starts hidden with default props', () => {
  render(<TooltipParagraph>This is tooltip description.</TooltipParagraph>);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('not render on hover when not truncated', async () => {
  render(
    <div style={{ width: '200px' }}>
      <TooltipParagraph>
        <span data-test="test-text">This is short</span>
      </TooltipParagraph>
    </div>,
  );

  await userEvent.hover(screen.getByTestId('test-text'));

  // Wait a moment for any potential tooltip to appear
  await new Promise(resolve => setTimeout(resolve, 100));

  // Check that no tooltip is visible in the document
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('render on hover when truncated', async () => {
  render(
    <div style={{ width: '200px' }}>
      <TooltipParagraph>
        <span data-test="test-text">This is too long and should truncate.</span>
      </TooltipParagraph>
    </div>,
  );

  // Get the div with the ellipsis class to verify it's truncated
  const ellipsisElement = screen
    .getByTestId('test-text')
    .closest('.ant-typography-ellipsis');
  expect(ellipsisElement).toBeInTheDocument();

  // Hover over the text
  await userEvent.hover(screen.getByTestId('test-text'));

  // In Ant Design v5, we can check if the aria-describedby attribute is present
  // which indicates the tooltip functionality is active
  await waitFor(() => {
    const element = screen
      .getByTestId('test-text')
      .closest('[aria-describedby]');
    expect(element).toHaveAttribute('aria-describedby');
  });
});
